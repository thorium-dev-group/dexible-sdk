import {Services} from 'dexible-common';

export interface ContactProps {
    apiClient: Services.APIClient;
}

export default class Contact {
    apiClient: Services.APIClient;

    constructor(props:ContactProps) {
        this.apiClient = props.apiClient;
    }

    add = async (email:string) => {
        return this.apiClient.post("contact-method/create", {
            identifier: email,
            contact_method: "email" //only support email for now
        });
    }

    getAll = async () => {
        return this.apiClient.get("contact-method/");
    }

    toggle = async (id) => {
        return this.apiClient.post(`contact-method/toggle/${id}`, {id});
    }
}