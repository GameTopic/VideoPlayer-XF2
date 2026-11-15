<?php

namespace TylerAustin\VideoPlayer\BbCode;

use XF\BbCode\Renderer\Html;
use XF\BbCode\Renderer\EmailHtml;
use XF\BbCode\Renderer\SimpleHtml;
use XF\InputFilterer;
use XF\Util\Arr;
use XF\Util\File;
use XF\Validator\Url;

class Player
{
    public static function render(array $children, $option, array $tag, array $options, Html $renderer)
    {
        $app = \XF::app();
        $source = $app->inputFilterer()->filter(
            $option ?? $renderer->renderSubTreePlain($children),
            InputFilterer::STR
        );
        $urlValidator = $app->validator(Url::class, ['allowed_schemes' => ['https']]);

        if (!$urlValidator->isValid($source) || $app->stringFormatter()->censorText($source) !== $source)
        {
            return $app->templater()->renderTemplate('public:tyl_video_player_invalid');
        }

        // Provider embeds must pass through XF's native MEDIA tag and cookie-consent flow.
        $extension = File::getFileExtension(parse_url($source, PHP_URL_PATH) ?? '');
        $audio = $tag['tag'] === 'vidstackaudio';
        $types = $audio
            ? ['mp3' => 'audio/mpeg', 'm4a' => 'audio/mp4', 'aac' => 'audio/aac', 'ogg' => 'audio/ogg', 'oga' => 'audio/ogg', 'wav' => 'audio/wav', 'flac' => 'audio/flac', 'opus' => 'audio/ogg', 'm3u8' => 'application/vnd.apple.mpegurl']
            : ['mp4' => 'video/mp4', 'm4v' => 'video/mp4', 'webm' => 'video/webm', 'ogv' => 'video/ogg', 'mov' => 'video/quicktime', 'm3u8' => 'application/vnd.apple.mpegurl'];
        if (!isset($types[$extension]))
        {
            return $app->templater()->renderTemplate('public:tyl_video_player_invalid');
        }

        if ($renderer instanceof EmailHtml || $renderer instanceof SimpleHtml)
        {
            return $renderer->renderTagUrl([$source], null, ['tag' => 'url'], $options);
        }

        $tracks = [];
        if ($option !== null)
        {
            $lines = Arr::stringToArray($renderer->renderSubTreePlain($children), '/\r?\n/');
            if (count($lines) > 16)
            {
                return $app->templater()->renderTemplate('public:tyl_video_player_invalid');
            }
            foreach ($lines AS $line)
            {
                // Each line is kind|language|label|HTTPS WebVTT URL.
                $parts = explode('|', $line, 4);
                if (count($parts) !== 4)
                {
                    return $app->templater()->renderTemplate('public:tyl_video_player_invalid');
                }
                [$kind, $language, $label, $trackSource] = $parts;
                if (!in_array($kind, ['captions', 'subtitles', 'chapters'], true)
                    || !preg_match('/^[a-zA-Z]{2,3}(?:-[a-zA-Z0-9]{2,8})*$/D', $language)
                    || $label === '' || strlen($label) > 100
                    || !$urlValidator->isValid($trackSource)
                    || File::getFileExtension(parse_url($trackSource, PHP_URL_PATH) ?? '') !== 'vtt'
                    || $app->stringFormatter()->censorText($trackSource) !== $trackSource)
                {
                    return $app->templater()->renderTemplate('public:tyl_video_player_invalid');
                }
                $tracks[] = ['kind' => $kind, 'language' => $language, 'label' => $label, 'src' => $trackSource];
            }
        }

        return $app->templater()->renderTemplate('public:tyl_video_player_media', [
            'source' => $source,
            'type' => $types[$extension],
            'audio' => $audio,
            'tracks' => $tracks,
            'contentType' => ($options['entity'] ?? null) instanceof \XF\Mvc\Entity\Entity
                ? $options['entity']->getEntityContentType() : '',
        ]);
    }
}
