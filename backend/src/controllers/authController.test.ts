import { Request, Response } from 'express';
import { login } from './authController';
import { UserService } from '../services/UserService';

// Mock the UserService
jest.mock('../services/UserService');

describe('AuthController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: jest.Mock;

  beforeEach(() => {
    mockRequest = {
      body: {},
    };
    mockResponse = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };
    nextFunction = jest.fn();
  });

  it('should return 200 and token on successful login', async () => {
    mockRequest.body = { email: 'test@example.com', password: 'password' };
    
    // Mock the service response
    (UserService.prototype.login as jest.Mock).mockResolvedValue({
      user: { id: '1', email: 'test@example.com', role: 'USER' },
      accessToken: 'fake-token',
    });

    await login(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.json).toHaveBeenCalledWith({
      user: expect.anything(),
      accessToken: 'fake-token',
    });
  });

  it('should call next with error if validation fails', async () => {
    mockRequest.body = { email: 'invalid-email' }; // Missing password

    await login(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(nextFunction).toHaveBeenCalled();
    expect(nextFunction.mock.calls[0][0]).toBeInstanceOf(Error); // Zod error
  });
});