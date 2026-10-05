// @vitest-environment nuxt
import { mountSuspended } from '@nuxt/test-utils/runtime';
import { describe, expect, it } from 'vitest';
import LogsHeader from '~/components/logs/LogsHeader.vue';

describe('LogsHeader', () => {
  it('labels the connection status and the live state', async () => {
    const wrapper = await mountSuspended(LogsHeader, {
      props: { status: 'open', paused: false, canClear: true, pendingCount: 0 },
    });

    expect(wrapper.text()).toContain('Connecté');
    expect(wrapper.text()).toContain('En direct');
  });

  it('labels a paused feed and a reconnecting stream', async () => {
    const wrapper = await mountSuspended(LogsHeader, {
      props: { status: 'error', paused: true, canClear: true, pendingCount: 0 },
    });

    expect(wrapper.text()).toContain('Reconnexion…');
    expect(wrapper.text()).toContain('En pause');
  });

  it('disables clearing when there is nothing to clear', async () => {
    const wrapper = await mountSuspended(LogsHeader, {
      props: { status: 'open', paused: false, canClear: false, pendingCount: 0 },
    });

    expect(wrapper.findAll('button')[0]!.attributes('disabled')).toBeDefined();
  });

  it('emits on both controls', async () => {
    const wrapper = await mountSuspended(LogsHeader, {
      props: { status: 'open', paused: false, canClear: true, pendingCount: 0 },
    });

    const [clear, pause] = wrapper.findAll('button');
    await clear!.trigger('click');
    await pause!.trigger('click');

    expect(wrapper.emitted('clear')).toHaveLength(1);
    expect(wrapper.emitted('toggle-pause')).toHaveLength(1);
  });

  describe('pending badge', () => {
    it('counts the buffered entries while paused', async () => {
      const wrapper = await mountSuspended(LogsHeader, {
        props: { status: 'open', paused: true, canClear: true, pendingCount: 23 },
      });

      expect(wrapper.text()).toContain('23 en attente');
    });

    it('stays hidden while the feed is live', async () => {
      const wrapper = await mountSuspended(LogsHeader, {
        props: { status: 'open', paused: false, canClear: true, pendingCount: 23 },
      });

      expect(wrapper.text()).not.toContain('en attente');
    });

    it('stays hidden when nothing is buffered', async () => {
      const wrapper = await mountSuspended(LogsHeader, {
        props: { status: 'open', paused: true, canClear: true, pendingCount: 0 },
      });

      expect(wrapper.text()).not.toContain('en attente');
    });
  });
});
