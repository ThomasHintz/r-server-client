// Main page for viewing entities.
// Fetches entity from entity service.
//
// Front-end node server caches fetches to entity service (default NextJS 13 behavior).
// Designed with a traditional form mechanism that allows page to function even without JS.
// Main page is a server component that fetches the data.
//
// Uses Panda CSS for pre-compiled style support with server components.

import { styled, Container, HStack } from '../../styled-system/jsx';

import Accordion from '@/components/Accordion';

export default async function Home({ searchParams }) {
  const entityId = typeof searchParams?.id === 'string' ? searchParams.id : false;
  // entityId validation performed server side. May trigger an error page if entityId is invalid.
  const res = entityId && await fetch(`${process.env.SERVER_URI}/entities?${new URLSearchParams({ id: searchParams.id }).toString()}`);
  const resJson = entityId ? await res.json() : { entities: [] };

  return (
    <Container>
      <form>
        <HStack paddingTop="0.75rem" paddingBottom="0.75rem">
          <label>
            Entity Id:{' '}
            <styled.input
              name="id"
              paddingInlineStart="1rem"
              paddingInlineEnd="1rem"
              height="2.5rem"
              borderRadius="0.375rem"
              borderWidth="1px"
              borderStyle="solid"
              borderColor="#e2e8f0"
              defaultValue={entityId || ''}
            />
          </label>
          <styled.button
            type="submit"
            outline="transparent solid 2px"
            outlineOffset="2px"
            lineHeight="1.2"
            borderRadius="0.375rem"
            fontWeight="600"
            height="2.5rem"
            minWidth="4rem"
            paddingInlineStart="1rem"
            paddingInlineEnd="1rem"
            background="#319795"
            color="white"
            cursor="pointer"
          >
            Submit
          </styled.button>
        </HStack>
      </form>
      {resJson.entities.map(({ entityId, name, properties }) => (
        <styled.div key={entityId}>
          <styled.h1 paddingBottom="4px" fontWeight="bold" fontSize="2rem">{name}</styled.h1>
          <Accordion
            data={Object.entries(properties).map(([category, value]) => {
                return {
                  title: category,
                  content: Object.entries(value).map(([name, v]) => (
                    <div key={name}>
                      {name}: {v}
                    </div>
                  ))
                };
            })}
          />
        </styled.div>
      ))}
    </Container>
  );
}
