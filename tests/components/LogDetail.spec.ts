// @vitest-environment nuxt
import { mountSuspended } from '@nuxt/test-utils/runtime';
import { describe, expect, it } from 'vitest';
import LogDetail from '~/components/logs/LogDetail.vue';
import { makeEntry } from '../factories';

describe('LogDetail', () => {
  it('lists the metadata of the selected entry and emits close', async () => {
    const entry = makeEntry({ message: 'Order created', metadata: { request_id: 'ff00aa' } });
    const wrapper = await mountSuspended(LogDetail, { props: { entry } });

    const fields = wrapper.findAll('[data-testid="detail-field"]');
    expect(fields.map((field) => field.text())).toContainEqual(expect.stringContaining('ff00aa'));
    expect(wrapper.text()).toContain('Order created');

    await wrapper.get('[aria-label="Fermer le détail"]').trigger('click');
    expect(wrapper.emitted('close')).toHaveLength(1);
  });
});
