class ApiErrors extends Error {
    private statusCode: number;
    private status: string;
    private isOperational: boolean;

    constructor(message: string, statusCode: number) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'failed' : 'error';
        this.isOperational = true;
    };
}

export default ApiErrors;