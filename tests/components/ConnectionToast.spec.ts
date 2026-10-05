// @vitest-environment nuxt
import { mountSuspended } from '@nuxt/test-utils/runtime';
import { describe, expect, it } from 'vitest';
import ConnectionToast from '~/components/ui/ConnectionToast.vue';
import type { ToastKind } from '~/composables/useToast';

describe('ConnectionToast', () => {
  it.each([
    ['lost', 'Connexion perdue'],
    ['restored', 'Connexion rétablie'],
    ['paused', 'Flux mis en pause'],
  ] as [ToastKind, string][])('renders the %s message', async (kind, text) => {
    const wrapper = await mountSuspended(ConnectionToast, { props: { kind } });

    expect(wrapper.text()).toContain(text);
  });

  it('renders nothing without a kind', async () => {
    const wrapper = await mountSuspended(ConnectionToast, { props: { kind: null } });

    expect(wrapper.text()).toBe('');
  });
});
