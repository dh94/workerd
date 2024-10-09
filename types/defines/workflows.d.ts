/**
 * NonRetryableError allows for a user to throw a fatal error
 * that makes a Workflow instance fail immediately without triggering a retry
 */
declare module "cloudflare:workflows" {
  export abstract class NonRetryableError extends Error {
    /**
     * `__brand` is used to differentiate between `NonRetryableError` and `Error`
     * and is omitted from the constructor because users should not set it
     */
    public constructor(message: string, name?: string);
  }
}

declare abstract class Workflow {
  /**
   * Get a handle to an existing instance of the Workflow.
   * @param name Name of the instance of this Workflow
   * @returns A promise that resolves with a handle for the Instance
   */
  public get(name: string): Promise<Instance>;

  /**
   * Create a new instance and return a handle to it. If a provided instance name exists, an error will be thrown.
   * @param name Name to create the instance of this Workflow with
   * @param params The payload to send over to this instance
   * @returns A promise that resolves with a handle for the Instance
   */
  public create(name: string, params: object): Promise<Instance>;
}

type InstanceStatus = {
  status:
    | "queued"
    | "running"
    | "paused"
    | "errored"
    | "terminated"
    | "complete"
    | "unknown";
  error?: string;
  output?: object;
};

interface WorkflowError {
  code?: number;
  message: string;
}

declare abstract class Instance {
  public id: string;
  public name: string;

  /**
   * Pause the instance.
   */
  public pause(): Promise<void>;

  /**
   * Resume the instance. If it is already running, an error will be thrown.
   */
  public resume(): Promise<void>;

  /**
   * Abort the instance. If it is errored, terminated or complete, an error will be thrown.
   */
  public abort(): Promise<void>;

  /**
   * Restart the instance.
   */
  public restart(): Promise<void>;

  /**
   * Returns the current status of the instance.
   */
  public status(): Promise<InstanceStatus>;
}
