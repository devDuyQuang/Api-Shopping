export class ApiResponse<T = any> {
    constructor(
        public success: boolean,
        public message: string,
        public data: T | null = null,
        public errors: any[] | null = null,
        public statusCode: number = 200,

    ) { }
}