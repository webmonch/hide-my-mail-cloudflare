export interface CloudflareResonse<T> {
  result?: T;
  success: boolean;
  errors: CloudflareResponseInfo[];
}

export interface CloudflareResponseInfo {
  code: number;
  message: string;
}

export interface CloudflareEmailRoutingSettings {
  id: string;
  tag: string;
  name: string;
  enabled: boolean;
  skip_wizard: boolean;
  synced: boolean;
  admin_locked: boolean;
  status: string;
}

export type RuleName = {
  createdAt: Date;
  name?: string;
  desc?: string;
};

export type MailRule = {
  name: RuleName;
  email: string;
  id: string;
  forwardsToEmail: string;
};
