const loopback = require('../../server/server.js');
const chai = require('chai');
const assert = chai.assert;
const expect = chai.expect;
const factory = require('../factory.js');
const DocumentService = require('../../server/services/document_service.js');
const constants = require('../../server/utils/constants/userConstants');

const app = loopback.dataSources.postgres.models;

describe('Document Service',() => {
  describe('Upload Document', () => {
    it('Return error for empty document upload', async () => {
      const manufacturer = await factory.create('Manufacturer');
      const dealer =  await factory.create('Dealer');
      const customerRole = await app.Roles.findOne({ where: { name: 'CUSTOMER' } });
      const user = await factory.create('User');
      const customerUserRole = await factory.create('UserRole', { user_id: user.id, role_id: customerRole.id });
      const newLead = await factory.create('Lead',
        { dealer_id: dealer.id, assigned_to: user.id, category: 'NEW',
          manufacturer_id: manufacturer.id, status: 200 });
      const currentUser = await app.Users.findOne({
        where: {
          id: user.id
        },
        include: {
          relation: "user_role",
          scope: { include: "role" }
        }
      });
      const req = {};
      req.files = [];
      const documentService = new DocumentService();
      documentService.upload(req, user.id, (error, document) => {
        assert.isNotNull(error, 'Document upload failed');
      });
    });
  });

  describe('Delete Document', () => {
    it('Return error for document not exist', async () => {
      const manufacturer = await factory.create('Manufacturer');
      const dealer =  await factory.create('Dealer');
      const customerRole = await app.Roles.findOne({ where: { name: 'CUSTOMER' } });
      const user = await factory.create('User');
      const customerUserRole = await factory.create('UserRole', { user_id: user.id, role_id: customerRole.id });
      const newLead = await factory.create('Lead',
        { dealer_id: dealer.id, assigned_to: user.id, category: 'NEW',
          manufacturer_id: manufacturer.id, status: 200 });
      const currentUser = await app.Users.findOne({
        where: {
          id: user.id
        },
        include: {
          relation: "user_role",
          scope: { include: "role" }
        }
      });
      const document = await factory.create('Document',
        { item_type_id: newLead.id, item_type_name: 'Dealer', customer_user_id: user.id });
      const documentService = new DocumentService(document.id);
      documentService.remove((error, document) => {
        assert.isNotNull(error, 'File not exist');
      });
    });

    it('Return error for invalid document id', async () => {
      const manufacturer = await factory.create('Manufacturer');
      const dealer =  await factory.create('Dealer');
      const customerRole = await app.Roles.findOne({ where: { name: 'CUSTOMER' } });
      const user = await factory.create('User');
      const customerUserRole = await factory.create('UserRole', { user_id: user.id, role_id: customerRole.id });
      const newLead = await factory.create('Lead',
        { dealer_id: dealer.id, assigned_to: user.id, category: 'NEW',
          manufacturer_id: manufacturer.id, status: 200 });
      const currentUser = await app.Users.findOne({
        where: {
          id: user.id
        },
        include: {
          relation: "user_role",
          scope: { include: "role" }
        }
      });
      const document = await factory.create('Document',
        { item_type_id: newLead.id, item_type_name: 'Dealer', customer_user_id: user.id });
      const documentService = new DocumentService(dealer.id);
      documentService.remove((error, document) => {
        assert.isNotNull(error, 'Invalid Document Id');
      });
    });
  });

  describe('Download Document', () => {
    it('Return error for invalid document id', async () => {
      const manufacturer = await factory.create('Manufacturer');
      const dealer =  await factory.create('Dealer');
      const customerRole = await app.Roles.findOne({ where: { name: 'CUSTOMER' } });
      const user = await factory.create('User');
      const customerUserRole = await factory.create('UserRole', { user_id: user.id, role_id: customerRole.id });
      const newLead = await factory.create('Lead',
        { dealer_id: dealer.id, assigned_to: user.id, category: 'NEW',
          manufacturer_id: manufacturer.id, status: 200 });
      const currentUser = await app.Users.findOne({
        where: {
          id: user.id
        },
        include: {
          relation: "user_role",
          scope: { include: "role" }
        }
      });
      const document = await factory.create('Document',
        { item_type_id: newLead.id, item_type_name: 'Dealer', customer_user_id: user.id });
      const documentService = new DocumentService(dealer.id);
      documentService.download({}, (error, document) => {
        assert.isNotNull(error, 'Invalid Document Id');
      });
    });
  });

  describe('Mark Document as Verified', () => {
    it('Return list of documents verified', async () => {
      const manufacturer = await factory.create('Manufacturer');
      const dealer =  await factory.create('Dealer');
      const customerRole = await app.Roles.findOne({ where: { name: 'CUSTOMER' } });
      const user = await factory.create('User');
      const customerUserRole = await factory.create('UserRole', { user_id: user.id, role_id: customerRole.id });
      const newLead = await factory.create('Lead',
        { dealer_id: dealer.id, assigned_to: user.id, category: 'NEW',
          manufacturer_id: manufacturer.id, status: 200 });
      const currentUser = await app.Users.findOne({
        where: {
          id: user.id
        },
        include: {
          relation: "user_role",
          scope: { include: "role" }
        }
      });
      const document = await factory.create('Document',
        { item_type_id: newLead.id, item_type_name: 'Dealer', customer_user_id: user.id });
      const documentIds = [];
      documentIds.push(document.id);
      const documentService = new DocumentService();
      documentService.markAsVerified(documentIds, (error, documents) => {
        assert.equal(documents[0].is_osv_verified, true);
      });
    });

    it('Return error for can\'t verify the invalid document', async () => {
      const manufacturer = await factory.create('Manufacturer');
      const dealer =  await factory.create('Dealer');
      const customerRole = await app.Roles.findOne({ where: { name: 'CUSTOMER' } });
      const user = await factory.create('User');
      const customerUserRole = await factory.create('UserRole', { user_id: user.id, role_id: customerRole.id });
      const newLead = await factory.create('Lead',
        { dealer_id: dealer.id, assigned_to: user.id, category: 'NEW',
          manufacturer_id: manufacturer.id, status: 200 });
      const currentUser = await app.Users.findOne({
        where: {
          id: user.id
        },
        include: {
          relation: "user_role",
          scope: { include: "role" }
        }
      });
      const document = await factory.create('Document',
        { item_type_id: newLead.id, item_type_name: 'Dealer', customer_user_id: user.id });
      const documentIds = [];
      documentIds.push(dealer.id);
      const documentService = new DocumentService();
      documentService.markAsVerified(documentIds, (error, documents) => {
        assert.isNotNull(error, 'Invalid Document Id');
      });
    });
  });
})
