// @vitest-environment nuxt
import { mountSuspended } from '@nuxt/test-utils/runtime';
import { describe, expect, it } from 'vitest';
import LogFilters from '~/components/logs/LogFilters.vue';
import { LOG_LEVELS } from '~/types/log';

const counts = { debug: 1, info: 2, warning: 3, error: 4, critical: 5 };

describe('LogFilters', () => {
  it('renders one button per level with its count', async () => {
    const wrapper = await mountSuspended(LogFilters, {
      props: { activeLevels: [...LOG_LEVELS], counts },
    });

    const buttons = wrapper.findAll('button');
    expect(buttons).toHaveLength(LOG_LEVELS.length);
    expect(wrapper.get('[data-testid="level-error"]').text()).toContain('4');
    expect(wrapper.get('[data-testid="level-debug"]').attributes('aria-pressed')).toBe('true');
  });

  it('marks an inactive level and emits toggle on click', async () => {
    const wrapper = await mountSuspended(LogFilters, {
      props: { activeLevels: ['info'], counts },
    });

    expect(wrapper.get('[data-testid="level-debug"]').attributes('aria-pressed')).toBe('false');

    await wrapper.get('[data-testid="level-warning"]').trigger('click');
    expect(wrapper.emitted('toggle')).toEqual([['warning']]);
  });
});
