// @vitest-environment nuxt
import { mountSuspended } from '@nuxt/test-utils/runtime';
import { describe, expect, it } from 'vitest';
import LogSearch from '~/components/logs/LogSearch.vue';

describe('LogSearch', () => {
  it('renders the current value and emits the typed one', async () => {
    const wrapper = await mountSuspended(LogSearch, { props: { modelValue: 'checkout' } });
    const input = wrapper.get('input');

    expect(input.element.value).toBe('checkout');

    await input.setValue('payment');
    expect(wrapper.emitted('update:modelValue')).toEqual([['payment']]);
  });
});
