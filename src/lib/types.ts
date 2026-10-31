export type RoleName = 'admin' | 'user' | string;

export interface Profile {
  user: {
    name?: string;
    email?: string;
    tenantId?: string;
    objectId?: string;
  };
  groups: string[];
  roles: RoleName[];
}

export interface Role {
  roleName: string;
  displayName: string;
  description?: string;
}

export interface GroupRoleMapping {
  id: number | string;
  groupObjectId: string;
  groupName?: string | null;
  roleName: string;
  createdAt?: string;
  updatedAt?: string;
}

export type QuoteStatus = 'quoted' | 'bound';

export interface Quote {
  id: string;
  applicantName: string;
  product: string;
  coverageAmount: number;
  premium: number;
  status: QuoteStatus;
  policyNumber?: string;
  createdAt: string;
  createdBy?: string;
  boundAt?: string;
}
