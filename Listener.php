<?php

namespace TylerAustin\VideoPlayer;

class Listener
{
    public static function templaterMacroPreRender(\XF\Template\Templater $templater, string &$type, string &$template, string &$name, array &$arguments, array &$globalVars)
    {
        if ($type !== 'admin' || $template !== 'option_macros' || $name !== 'option_form_block')
        {
            return;
        }
        $group = $arguments['group'] ?? null;
        if (!($group instanceof \XF\Entity\OptionGroup) || $group->group_id !== 'tylVideoPlayer')
        {
            return;
        }
        $template = 'tyl_video_player_option_macros';
        $name = 'option_form_block_tabs';
        $arguments['headers'] = [
            'generalOptions' => [
                'label' => \XF::phrase('general_options'),
                'minDisplayOrder' => 0,
                'maxDisplayOrder' => 1000,
                'active' => true,
            ],
            'brandingOptions' => [
                'label' => \XF::phrase('tyl_video_player_branding'),
                'minDisplayOrder' => 1000,
                'maxDisplayOrder' => 2000,
                'active' => false,
            ],
        ];
    }
}
