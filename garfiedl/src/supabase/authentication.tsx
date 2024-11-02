export function isValidPassword(password: string): boolean {
    switch (true) {
        case password.length < 8:
            return false;
    }
    return true;
}

export function isValidEmail(email: string): boolean {
    return !!email.trim().match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
}