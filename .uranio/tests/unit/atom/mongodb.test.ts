/**
 * Unit tests for MongoDB Atom Client
 * Tests atom methods with mocked database connections
 */

import {MongoDBAtomClient} from '../../../src/atom/mongodb';
import {ObjectId} from 'mongodb';

type TestAtom = {
  _id: ObjectId;
  name: string;
  age: number;
  email: string;
};

describe('MongoDBAtomClient', () => {
  let mockDb: any;
  let mockCollection: any;
  let atomClient: MongoDBAtomClient<TestAtom>;

  beforeEach(() => {
    mockCollection = {
      countDocuments: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      insertOne: jest.fn(),
      insertMany: jest.fn(),
      updateOne: jest.fn(),
      updateMany: jest.fn(),
      deleteOne: jest.fn(),
      deleteMany: jest.fn(),
      aggregate: jest.fn(),
    };

    mockDb = {
      collection: jest.fn().mockReturnValue(mockCollection),
    };

    atomClient = new MongoDBAtomClient(mockDb, 'test_collection');
  });

  describe('countAtoms', () => {
    it('should count all atoms without WHERE clause', async () => {
      mockCollection.countDocuments.mockResolvedValue(42);

      const count = await atomClient.countAtoms({});

      expect(count).toBe(42);
      expect(mockCollection.countDocuments).toHaveBeenCalledTimes(1);
      expect(mockCollection.countDocuments).toHaveBeenCalledWith(undefined);
    });

    it('should count atoms with simple WHERE clause', async () => {
      mockCollection.countDocuments.mockResolvedValue(10);

      const count = await atomClient.countAtoms({where: {age: 25}});

      expect(count).toBe(10);
      expect(mockCollection.countDocuments).toHaveBeenCalledTimes(1);
      expect(mockCollection.countDocuments).toHaveBeenCalledWith({age: 25});
    });

    it('should count atoms with comparison operators', async () => {
      mockCollection.countDocuments.mockResolvedValue(5);

      const count = await atomClient.countAtoms({where: {age: {$gte: 18}}});

      expect(count).toBe(5);
      expect(mockCollection.countDocuments).toHaveBeenCalledTimes(1);
      expect(mockCollection.countDocuments).toHaveBeenCalledWith({age: {$gte: 18}});
    });

    it('should count atoms with multiple WHERE conditions', async () => {
      mockCollection.countDocuments.mockResolvedValue(3);

      const count = await atomClient.countAtoms({
        where: {
          age: {$gte: 18},
          name: 'John',
        },
      });

      expect(count).toBe(3);
      expect(mockCollection.countDocuments).toHaveBeenCalledTimes(1);
    });

    it('should return 0 when no documents match', async () => {
      mockCollection.countDocuments.mockResolvedValue(0);

      const count = await atomClient.countAtoms({where: {name: 'NonExistent'}});

      expect(count).toBe(0);
    });

    it('should count atoms with $in operator', async () => {
      mockCollection.countDocuments.mockResolvedValue(15);

      const count = await atomClient.countAtoms({
        where: {
          name: {$in: ['John', 'Jane', 'Bob']},
        },
      });

      expect(count).toBe(15);
      expect(mockCollection.countDocuments).toHaveBeenCalledTimes(1);
    });

    it('should count atoms with $or operator', async () => {
      mockCollection.countDocuments.mockResolvedValue(20);

      const count = await atomClient.countAtoms({
        where: {
          $or: [{age: {$lt: 18}}, {age: {$gt: 65}}],
        },
      });

      expect(count).toBe(20);
      expect(mockCollection.countDocuments).toHaveBeenCalledTimes(1);
    });

    it('should handle large counts', async () => {
      mockCollection.countDocuments.mockResolvedValue(1000000);

      const count = await atomClient.countAtoms({});

      expect(count).toBe(1000000);
    });

    it('should convert string _id to ObjectId', async () => {
      const testId = '507f1f77bcf86cd799439011';
      mockCollection.countDocuments.mockResolvedValue(1);

      const count = await atomClient.countAtoms({
        where: {_id: testId as any},
      });

      expect(count).toBe(1);
      expect(mockCollection.countDocuments).toHaveBeenCalledTimes(1);
      const callArgs = mockCollection.countDocuments.mock.calls[0][0];
      expect(callArgs._id).toBeInstanceOf(ObjectId);
      expect(callArgs._id.toString()).toBe(testId);
    });

    it('should handle ObjectId in nested where conditions', async () => {
      const testId = '507f1f77bcf86cd799439011';
      mockCollection.countDocuments.mockResolvedValue(5);

      const count = await atomClient.countAtoms({
        where: {
          $or: [{_id: testId as any}, {name: 'John'}],
        },
      });

      expect(count).toBe(5);
      expect(mockCollection.countDocuments).toHaveBeenCalledTimes(1);
    });

    it('should count with empty where object', async () => {
      mockCollection.countDocuments.mockResolvedValue(100);

      const count = await atomClient.countAtoms({where: {}});

      expect(count).toBe(100);
      expect(mockCollection.countDocuments).toHaveBeenCalledWith({});
    });
  });
});
