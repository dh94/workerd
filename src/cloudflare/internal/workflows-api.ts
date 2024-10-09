// Copyright (c) 2024 Cloudflare, Inc.
// Licensed under the Apache 2.0 license found in the LICENSE file or at:
//     https://opensource.org/licenses/Apache-2.0

export class NonRetryableError extends Error {
  // `__brand` is how engine validates that the user returned a `NonRetryableError`
  // imported from "cloudflare:workflows"
  // This enables them to extend NonRetryableError for their own Errors
  // as well by overriding name
  // Private fields are not serialized over RPC
  public readonly __brand: string = 'NonRetryableError';

  public constructor(message: string, name = 'NonRetryableError') {
    super(message);
    this.name = name;
  }
}

interface Fetcher {
  fetch: typeof fetch;
}

async function callFetcher<T>(
  fetcher: Fetcher,
  path: string,
  body: object
): Promise<T> {
  const res = await fetcher.fetch(`http://workflow-binding.local${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Version': '1',
    },
    body: JSON.stringify(body),
  });

  const response = (await res.json()) as {
    result: T;
    error?: WorkflowError;
  };

  if (res.ok) {
    return response.result;
  } else {
    throw new Error(response.error?.message);
  }
}

class InstanceImpl implements Instance {
  private readonly fetcher: Fetcher;
  public readonly id: string;
  public readonly name: string;

  public constructor(id: string, name: string, fetcher: Fetcher) {
    this.id = id;
    this.name = name;
    this.fetcher = fetcher;
  }

  public async pause(): Promise<void> {
    await callFetcher(this.fetcher, '/pause', {
      id: this.id,
    });
  }
  public async resume(): Promise<void> {
    await callFetcher(this.fetcher, '/resume', {
      id: this.id,
    });
  }

  public async abort(): Promise<void> {
    await callFetcher(this.fetcher, '/abort', {
      id: this.id,
    });
  }

  public async restart(): Promise<void> {
    await callFetcher(this.fetcher, '/restart', {
      id: this.id,
    });
  }

  public async status(): Promise<InstanceStatus> {
    const result = await callFetcher<InstanceStatus>(this.fetcher, '/status', {
      id: this.id,
    });
    return result;
  }
}

class WorkflowImpl {
  private readonly fetcher: Fetcher;

  public constructor(fetcher: Fetcher) {
    this.fetcher = fetcher;
  }

  public async get(name: string): Promise<Instance> {
    const result = await callFetcher<{
      instanceId: string;
      instanceName: string;
    }>(this.fetcher, '/get', { name });

    return new InstanceImpl(
      result.instanceId,
      result.instanceName,
      this.fetcher
    );
  }

  public async create(name: string, params: object): Promise<Instance> {
    const result = await callFetcher<{
      instanceId: string;
      instanceName: string;
    }>(this.fetcher, '/create', { name, params });

    return new InstanceImpl(
      result.instanceId,
      result.instanceName,
      this.fetcher
    );
  }
}

export function makeBinding(env: { fetcher: Fetcher }): Workflow {
  return new WorkflowImpl(env.fetcher);
}

export default makeBinding;
