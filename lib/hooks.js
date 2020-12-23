import { Magic } from 'magic-sdk';
import { WebAuthnExtension } from '@magic-ext/webauthn';
import { useEffect } from 'react';
import Router from 'next/router';
import useSWR from 'swr';

const fetchUser = (url) =>
  fetch(url)
    .then((r) => r.json())
    .then((data) => {
      return { user: data?.user || null };
    });

export function useUser({ redirectTo, redirectIfFound } = {}) {
  const { data, error } = useSWR('/api/user', fetchUser);
  const user = data?.user;
  const finished = Boolean(data);
  const hasUser = Boolean(user);

  useEffect(() => {
    if (!redirectTo || !finished) return;
    if (
      // If redirectTo is set, redirect if the user was not found.
      (redirectTo && !redirectIfFound && !hasUser) ||
      // If redirectIfFound is also set, redirect if the user was found
      (redirectIfFound && hasUser)
    ) {
      Router.push(redirectTo);
    }
  }, [redirectTo, redirectIfFound, finished, hasUser]);
  return error ? null : user;
}

const fetchWebauthn = async () => {
  let magic = new Magic(process.env.NEXT_PUBLIC_MAGIC_PUBLISHABLE_KEY, {
    extensions: [new WebAuthnExtension()],
  });
  let data = await magic?.webauthn.getMetadata();
  return { webauthn: data || null };
};

export function useWebauthn() {
  const { data, error } = useSWR(' ', fetchWebauthn);
  const webauthn = data?.webauthn;
  return error ? null : webauthn;
}
