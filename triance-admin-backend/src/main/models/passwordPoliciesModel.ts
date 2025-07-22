import { IPasswordPolicy } from "../types/custom";

class PasswordPolicy implements IPasswordPolicy {
    id: number;
    password_expiry: number;
    password_history: number;
    minimum_password_length: number;
    complexity: number;
    alphabetical: boolean;  
    numeric: boolean;       
    special_characters: boolean; 
    allowed_special_characters: string;
    maximum_invalid_attempts: number;
    date_created: string | undefined;
    date_updated: string | undefined;

    constructor(passwordPolicy: IPasswordPolicy) {
        this.id = passwordPolicy.id || 0;
        this.password_expiry = passwordPolicy.password_expiry || 90;
        this.password_history = passwordPolicy.password_history || 5;
        this.minimum_password_length = passwordPolicy.minimum_password_length;
        this.complexity = passwordPolicy.complexity;
        this.alphabetical = passwordPolicy.alphabetical;
        this.numeric = passwordPolicy.numeric;
        this.special_characters = passwordPolicy.special_characters;
        this.allowed_special_characters = passwordPolicy.allowed_special_characters;
        this.maximum_invalid_attempts = passwordPolicy.maximum_invalid_attempts;
        this.date_created = passwordPolicy.date_created;
        this.date_updated = passwordPolicy.date_updated;
    }
}

export { PasswordPolicy };
