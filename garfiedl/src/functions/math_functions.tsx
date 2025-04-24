const DEGREES_TO_RADIANS = Math.PI / 180;
const RADIANS_TO_DEGREES = 180 / Math.PI;
export function toRadians(degrees: number) {
    return degrees * DEGREES_TO_RADIANS
}

export function toDegrees(radians: number) {
    return radians * RADIANS_TO_DEGREES;
}