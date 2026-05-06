import { Router } from 'express';
import { createAddress, deleteAddress, getAddress, getAddresses, getCountries, getZones, setDefaultAddress, updateAddress } from './customerAddress.controller.js';
import { addressValidation, updateValidation } from '../../utils/address.validation.js';
import { authMiddleware } from '../../middlewares/authMiddleware.js';
import { asyncHandler } from '../../utils/asyncHandler.js';



const customerAddressRoutes = Router();

customerAddressRoutes.get('/countries',  authMiddleware, asyncHandler(getCountries));
customerAddressRoutes.get('/zones/:countryId',  authMiddleware, asyncHandler(getZones));
customerAddressRoutes.get('/',  authMiddleware, asyncHandler(getAddresses));
customerAddressRoutes.post('/create-address', addressValidation,  authMiddleware, asyncHandler(createAddress));
customerAddressRoutes.get('/:addressId',  authMiddleware, asyncHandler(getAddress));
customerAddressRoutes.put('/:addressId', updateValidation,  authMiddleware, asyncHandler(updateAddress));
customerAddressRoutes.delete('/:addressId',  authMiddleware, asyncHandler(deleteAddress));
customerAddressRoutes.patch('/:addressId/default',  authMiddleware, asyncHandler(setDefaultAddress));

export default customerAddressRoutes;