import {
    CallHandler,
    ExecutionContext,
    Injectable,
    NestInterceptor,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { ApiResponse } from "../response/response.dto"

import { Response } from 'express';

@Injectable()
export class ResponseInterceptor<T = any> implements NestInterceptor<T, ApiResponse<T>
> {
    intercept(
        context: ExecutionContext,
        next: CallHandler,
    ): Observable<ApiResponse<T>> {
        const httpContext = context.switchToHttp();
        const response = httpContext.getResponse<Response>();

        // lấy statusCode một cách type-safe
        const statusCode: number =
            typeof response.statusCode === 'number' ? response.statusCode : 200;
        // const statusCode = context.switchToHttp().getResponse().statusCode;

        return next.handle().pipe(
            map((data) => {
                if (data instanceof ApiResponse) {
                    if (data.statusCode === undefined || data.statusCode === 0) {
                        data.statusCode = statusCode;
                    }
                    return data;
                }
                return new ApiResponse(true, 'Success', data, null, statusCode);
            })
        );
    }
}
