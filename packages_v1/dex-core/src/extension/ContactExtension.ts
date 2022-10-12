import {
    APIExtensionProps,
    Services
} from 'dexible-common';


export class ContactExtension {
    apiClient: Services.APIClient;

    constructor(props:APIExtensionProps) {
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
