// @vitest-environment nuxt
import { mountSuspended } from '@nuxt/test-utils/runtime';
import { describe, expect, it } from 'vitest';
import LogTable from '~/components/logs/LogTable.vue';
import type { LogEntry } from '~/types/log';
import { makeEntry } from '../factories';

describe('LogTable', () => {
  it('renders a row per entry and emits the picked id', async () => {
    const entries = [makeEntry({ id: 'a' }), makeEntry({ id: 'b' })];
    const wrapper = await mountSuspended(LogTable, { props: { entries, selectedId: 'b' } });

    const rows = wrapper.findAll('[data-testid="log-row"]');
    expect(rows).toHaveLength(2);
    expect(rows[1]!.attributes('aria-pressed')).toBe('true');

    await rows[0]!.trigger('click');
    expect(wrapper.emitted('select')).toEqual([['a']]);
  });

  it('expands the detail of the selected row only', async () => {
    const entries = [makeEntry({ id: 'a' }), makeEntry({ id: 'b' })];
    const wrapper = await mountSuspended(LogTable, { props: { entries, selectedId: 'b' } });

    expect(wrapper.findAll('[aria-label="Détail de l\'entrée"]')).toHaveLength(1);
  });

  it('shows the empty state when nothing matches', async () => {
    const wrapper = await mountSuspended(LogTable, { props: { entries: [], selectedId: null } });

    expect(wrapper.findAll('[data-testid="log-row"]')).toHaveLength(0);
    expect(wrapper.text()).toContain('Aucune entrée ne correspond');
  });

  describe('unseen entries', () => {
    const mountScrolled = async (entries: LogEntry[], scrollTop: number) => {
      const wrapper = await mountSuspended(LogTable, { props: { entries, selectedId: null } });
      const scroller = wrapper.find('.overflow-y-auto');
      Object.defineProperty(scroller.element, 'scrollTop', { value: scrollTop, writable: true });
      scroller.element.scrollTo = () => {};
      await scroller.trigger('scroll');
      return { wrapper, scroller };
    };

    it('stays quiet while the top of the list is in view', async () => {
      const { wrapper } = await mountScrolled([makeEntry({ id: 'a' })], 0);

      await wrapper.setProps({ entries: [makeEntry({ id: 'b' }), makeEntry({ id: 'a' })] });

      expect(wrapper.find('[data-testid="unseen-jump"]').exists()).toBe(false);
    });

    it('counts the entries prepended while scrolled away from the top', async () => {
      const seen = makeEntry({ id: 'seen' });
      const { wrapper } = await mountScrolled([seen], 400);

      await wrapper.setProps({
        entries: [makeEntry({ id: 'n1' }), makeEntry({ id: 'n2' }), seen],
      });

      expect(wrapper.find('[data-testid="unseen-jump"]').text()).toContain('2 nouvelles entrées');
    });

    it('resets instead of counting the whole list when the filters change', async () => {
      const seen = makeEntry({ id: 'seen' });
      const { wrapper } = await mountScrolled([seen], 400);

      await wrapper.setProps({ entries: [makeEntry({ id: 'other' })] });

      expect(wrapper.find('[data-testid="unseen-jump"]').exists()).toBe(false);
    });

    it('clears the badge once the jump sends the reader back to the top', async () => {
      const seen = makeEntry({ id: 'seen' });
      const { wrapper } = await mountScrolled([seen], 400);
      await wrapper.setProps({ entries: [makeEntry({ id: 'fresh' }), seen] });

      await wrapper.find('[data-testid="unseen-jump"]').trigger('click');

      expect(wrapper.find('[data-testid="unseen-jump"]').exists()).toBe(false);
    });
  });
});
