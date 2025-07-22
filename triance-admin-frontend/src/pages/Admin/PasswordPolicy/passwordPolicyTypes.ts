export interface IPasswordPolicy {
    id: number;
    password_expiry: number;
    password_history: number;
    minimum_password_length: number;
    complexity: number;
    alphabetical: number;
    numeric: number;
    special_characters: number;
    allowed_special_characters: string;
    maximum_invalid_attempts: number;
    date_created: string | undefined;
    date_updated: string | undefined;
}