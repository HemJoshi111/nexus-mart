class ApiError extends Error {
    constructor(
        statusCode,
        message = "Something went wrong",
        errors = [],
        stack = ""
    ) {
        // Override default Error properties
        super(message); // Call the constructor of the parent 'Error' class
        this.statusCode = statusCode;
        this.data = null; // Used for extra context, but often set to null
        this.message = message;
        this.success = false; // Always false for an error response
        this.errors = errors;

        // Clean up the error stack trace
        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

export { ApiError };