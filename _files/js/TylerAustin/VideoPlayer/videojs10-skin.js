/* Copyright (c) 2026 TylerAustin. Skin markup derives from @videojs/html 10.3.0 (Apache-2.0). */
// Match the bootstrap's versioned runtime URL so ESM registers one control graph.
const runtimeUrl = new URL('./vendor/videojs10/player.min.js', import.meta.url);
const skinUrl = new URL(import.meta.url);
for (const key of ['_v', '_mt'])
{
    if (skinUrl.searchParams.has(key)) runtimeUrl.searchParams.set(key, skinUrl.searchParams.get(key));
}
const { PlayerController, VideoSkinElement, MenuRadioGroupElement, formatTime, formatTimeAsPhrase } = await import(runtimeUrl.href);

const template = document.querySelector('template.js-tylVideojs10Skin');
if (!template)
{
    throw new Error('[TylerAustin/VideoPlayer] The Video.js skin template is missing.');
}

class TylMenuRadioGroup extends MenuRadioGroupElement
{
    static tagName = 'tyl-menu-radio-group';
    static properties = {
        ...MenuRadioGroupElement.properties,
        available: { type: Boolean },
    };

    constructor ()
    {
        super();
        this.available = false;
    }

    update (changed)
    {
        const available = this.available;
        this.hidden = !available;
        if (available) this.removeAttribute('aria-disabled');
        else this.setAttribute('aria-disabled', 'true');
        this.publishMenuOptionState(!available, !available, available ? 'available' : 'unavailable');
        super.update(changed);
    }
}

class TylVideoSkin extends VideoSkinElement
{
    static tagName = 'tyl-video-skin';
    static template = template;

    #player = new PlayerController(this);
    #state = new PlayerController(this, state => ({
        chapters: state.chaptersCues,
        time: state.currentTime,
        tracks: state.textTrackList,
    }));
    #events = null;
    #chapters = null;
    #chapterRows = [];
    #connection = 0;

    connectedCallback ()
    {
        this.#connection++;
        super.connectedCallback();
        if (this.destroyed)
        {
            return;
        }
        this.#events?.abort();
        this.#events = new AbortController();
        this.shadowRoot.addEventListener('value-change', event =>
        {
            const group = event.target;
            if (group.hasAttribute('data-tyl-chapters'))
            {
                const index = Number(group.value);
                const state = this.#state.value;
                if (Number.isInteger(index) && index >= 0 && index < (state?.chapters.length ?? 0))
                {
                    this.#player.value.seek(state.chapters[index].startTime).catch(error =>
                    {
                        console.error('[TylerAustin/VideoPlayer] Unable to seek to this chapter.', error);
                    });
                }
                return;
            }
            const attribute = group.getAttribute('data-tyl-caption-setting');
            if (!attribute)
            {
                return;
            }
            const wrapper = this.closest('.tylVideoPlayer--videojs10');
            const selected = Array.from(group.querySelectorAll('media-menu-radio-item[value]'))
                .some(item => item.getAttribute('value') === group.value);
            if (wrapper && selected)
            {
                if (group.value === 'default')
                {
                    wrapper.removeAttribute(attribute);
                }
                else
                {
                    wrapper.setAttribute(attribute, group.value);
                }
            }
        }, { signal: this.#events.signal });

        this.shadowRoot.querySelector('[data-tyl-caption-reset]').addEventListener('select', () =>
        {
            const wrapper = this.closest('.tylVideoPlayer--videojs10');
            for (const group of this.shadowRoot.querySelectorAll('[data-tyl-caption-setting]'))
            {
                wrapper?.removeAttribute(group.getAttribute('data-tyl-caption-setting'));
                group.value = 'default';
            }
        }, { signal: this.#events.signal });
    }

    disconnectedCallback ()
    {
        this.#connection++;
        this.#events?.abort();
        this.#events = null;
        super.disconnectedCallback();
    }

    destroyCallback ()
    {
        this.#connection++;
        this.#events?.abort();
        this.#events = null;
        this.#chapters = null;
        this.#chapterRows = [];
        super.destroyCallback();
    }

    update (changed)
    {
        super.update(changed);
        const state = this.#state.value;
        if (!state)
        {
            return;
        }
        const root = this.shadowRoot;
        const focused = root.activeElement;
        const wrapper = this.closest('.tylVideoPlayer--videojs10');
        root.querySelector('media-pip-button').disabled = wrapper?.dataset.pipDisabled === 'true';
        root.querySelector('media-hotkey[action="togglePictureInPicture"]').disabled = wrapper?.dataset.pipDisabled === 'true';
        root.querySelector('media-airplay-button').disabled = wrapper?.dataset.airplayDisabled === 'true';
        const hasCaptions = state.tracks.some(track => track.kind === 'captions' || track.kind === 'subtitles');
        const nativeCaptions = wrapper?.dataset.captionRenderer === 'native';
        const captionTrigger = root.querySelector('[data-tyl-caption-trigger]');
        const chapterTrigger = root.querySelector('[data-tyl-chapters-trigger]');
        const captionStylesAvailable = hasCaptions && nativeCaptions;
        const chaptersAvailable = state.chapters.length > 0;
        for (const setting of root.querySelectorAll('[data-tyl-caption-setting]')) setting.available = captionStylesAvailable;
        const group = root.querySelector('[data-tyl-chapters]');
        group.available = chaptersAvailable;
        // Native menu pages become siblings when normalized. Include the focused
        // appearance/chapter page when its options disappear, not only its trigger.
        const focusedPage = focused?.closest('media-menu-content')?.id || '';
        const unavailableCaptionFocus = !captionStylesAvailable
            && (focused === captionTrigger || focusedPage.startsWith('tyl-caption-'));
        const unavailableChapterFocus = !chaptersAvailable
            && (focused === chapterTrigger || focusedPage === 'tyl-chapters');
        if (focused && (unavailableCaptionFocus || unavailableChapterFocus))
        {
            const menu = root.querySelector('media-menu');
            const settings = Array.from(root.querySelectorAll('[commandfor]'))
                .find(item => item.getAttribute('commandfor') === menu.id);
            this.restoreFocus(settings, focused);
        }

        if (state.chapters !== this.#chapters)
        {
            this.#chapters = state.chapters;
            const row = root.querySelector('template.js-tylChapterRow');
            const focusedIndex = this.#chapterRows.findIndex(entry => entry.item === focused);
            const pool = new Map();
            for (const entry of this.#chapterRows)
            {
                if (!pool.has(entry.key)) pool.set(entry.key, []);
                pool.get(entry.key).push(entry);
            }
            const entries = state.chapters.map((cue, index) =>
            {
                const key = JSON.stringify([cue.startTime, cue.endTime, cue.text]);
                const existing = pool.get(key)?.shift();
                const item = existing?.item || row.content.firstElementChild.cloneNode(true);
                if (item.value !== String(index)) item.setAttribute('value', String(index));
                item.querySelector('[data-part="label"]').textContent = cue.text;
                item.querySelector('[data-part="time"]').textContent = formatTime(cue.startTime);
                const title = cue.text.trim() || `${row.dataset.chapterLabel} ${index + 1}`;
                const label = `${title} — ${formatTimeAsPhrase(cue.startTime, { locale: document.documentElement.lang || 'en' })}`;
                if (item.getAttribute('aria-label') !== label) item.setAttribute('aria-label', label);
                return { key, item };
            });
            const retained = new Set(entries.map(entry => entry.item));
            for (const entry of this.#chapterRows)
            {
                if (!retained.has(entry.item)) entry.item.remove();
            }
            entries.forEach((entry, index) =>
            {
                if (group.children[index] !== entry.item) group.insertBefore(entry.item, group.children[index] || null);
            });
            this.#chapterRows = entries;
            if (chaptersAvailable && focusedIndex >= 0 && root.activeElement !== focused)
            {
                const target = entries.find(entry => entry.item === focused)?.item
                    || entries[Math.min(focusedIndex, entries.length - 1)]?.item
                    || root.querySelector('#tyl-chapters > media-menu-item');
                this.restoreFocus(target, focused, entries.map(entry => entry.item));
            }
        }
        const active = state.chapters.findIndex(cue => cue.startTime <= state.time && state.time < cue.endTime);
        group.value = active < 0 ? '' : String(active);
    }

    restoreFocus (target, previous, items = [])
    {
        const connection = this.#connection;
        Promise.all(items.map(item => item.updateComplete)).then(() =>
        {
            if (connection !== this.#connection || this.destroyed || !this.isConnected || !target?.isConnected) return;
            const active = this.shadowRoot.activeElement;
            const documentActive = this.ownerDocument.activeElement;
            if (active && active !== previous) return;
            if (documentActive !== this && documentActive !== this.ownerDocument.body) return;
            target.focus({ preventScroll: true });
        }).catch(error =>
        {
            console.error('[TylerAustin/VideoPlayer] Unable to restore menu focus.', error);
        });
    }
}

customElements.define(TylMenuRadioGroup.tagName, TylMenuRadioGroup);
customElements.define('tyl-video-skin', TylVideoSkin);
