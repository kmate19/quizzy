import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";

import HelloWorld from "@/components/HelloWorld.vue";

describe("component_renders", () => {
  it("helloworld properly", () => {
    const wrapper = mount(HelloWorld, { props: { msg: 'Hello Vitest' } })
    expect(wrapper.text()).toContain('Hello Vitest')
  }),
    it("component2 properly", () => {
      const wrapper = mount(HelloWorld, { props: { msg: 'Hello Vitest' } })
      expect(wrapper.text()).toContain('Hello Vitest')
    }),
    it("component3 properly", () => {
      // Placeholder
    });
});
