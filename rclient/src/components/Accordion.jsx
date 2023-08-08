'use client';

// Uses the Zag accordion state machine to ensure functionality and accessibility.

import { css } from '../../styled-system/css'
import { styled } from '../../styled-system/jsx';

import * as accordion from "@zag-js/accordion"
import { useMachine, normalizeProps } from "@zag-js/react"

const buttonStyles = css({
  '&[data-part="trigger"][data-state="open"]': {
    _before: { content: '"↓"' }
  },
  '&[data-part="trigger"][data-state="closed"]': {
    _before: { content: '"→"' }
  },
});

export default function Accordion({ data }) {
  const [state, send] = useMachine(accordion.machine({ id: "1", collapsible: true, multiple: true }))

  const api = accordion.connect(state, send, normalizeProps)

  return (
    <styled.div borderColor="#e2e8f0" borderStyle="solid" {...api.rootProps}>
      {data.map((item) => (
        <styled.div
          key={JSON.stringify(item)}
          borderWidth="1px"
          borderColor="#e2e8f0"
          {...api.getItemProps({ value: item.title })}
          >
          <h3>
            <styled.button
              fontWeight="bold"
              className={buttonStyles}
              paddingTop="0.5rem"
              paddingBottom="0.5rem"
              paddingInlineStart="0.75rem"
              cursor="pointer"
              {...api.getTriggerProps({ value: item.title })}
            >
              {item.title}
            </styled.button>
          </h3>
          <styled.div
            paddingTop="0.5rem"
            paddingBottom="0.5rem"
            paddingInlineStart="0.75rem"
            paddingInlineEnd="0.75rem"
            {...api.getContentProps({ value: item.title })}
          >
            {item.content}
          </styled.div>
        </styled.div>
      ))}
    </styled.div>
  )
}
