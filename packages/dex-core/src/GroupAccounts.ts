
import {Services, Tag, Token} from 'dexible-common';

export const RoleTypes = {
    //has full privileges for a group
    ADMIN: 1,

    //read-only member
    VIEWER: 1<<1,

    //member with trading abilities
    TRADER: 1<<2,

    //wallet used for trading
    TRADING: 1<<3
}

export interface GroupAttributes {
    name: string;
}

export interface GroupRole {
    wallet: string;
    state: string | null | undefined;
    roles: number;
}

export interface GroupAccount {
    id: number;
    name: string;
    members: Array<GroupRole>;
}

export interface RoleAttributes {
    wallet: string;
    group_id: number;
    roles: number;
}

export default class GroupAccounts {

    api: Services.APIClient;

    static isValidRole = role => {
        if(!role) {
            return false;
        }


        switch(role) {
            case RoleTypes.ADMIN:
            case RoleTypes.VIEWER:
            case RoleTypes.TRADER:
            case RoleTypes.TRADING:
            case RoleTypes.VIEWER | RoleTypes.TRADING:
            case RoleTypes.ADMIN | RoleTypes.TRADING:
            case RoleTypes.TRADER | RoleTypes.TRADING:
                return true;
            default: return false;
        }
    }

    constructor(apiClient: Services.APIClient) {
        this.api = apiClient;
    }

    async create(props: GroupAttributes) : Promise<GroupAccount> {
       const r = await this.api.post('group_accounts/create', {
            name: props.name
        });
        return r as GroupAccount;
    }

    async update(props: GroupAttributes) : Promise<GroupAccount> {
        const r = await this.api.post('group_accounts/update', {
            name: props.name
        });
        return r as GroupAccount;
    }

    async addRoles(props: RoleAttributes) : Promise<GroupAccount> {
        const r = await this.api.post("group_accounts/setRole", {
            props
        })
        return r as GroupAccount;
    }

    async approveRoles(props: RoleAttributes) : Promise<GroupRole> {
        const r = await this.api.post("group_accounts/approveRole", {
            props
        });
        return r as GroupRole;
    }

    async removeWallet(wallet: string) : Promise<boolean> {
        const r = await this.api.post("group_accounts/removeWallet", {
            wallet
        });
        return r;
    }

}