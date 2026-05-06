import { Router } from 'express';
import { createAddress, deleteAddress, getAddress, getAddresses, setDefaultAddress, updateAddress } from './customerAddress.controller';
import { addressValidation, updateValidation } from '../../utils/address.validation';
import { authMiddleware } from '../../middlewares/authMiddleware';
import { asyncHandler } from '../../utils/asyncHandler';



const customerAddressRoutes = Router();

customerAddressRoutes.get('/',  authMiddleware, asyncHandler(getAddresses));
customerAddressRoutes.post('/', addressValidation,  authMiddleware, asyncHandler(createAddress));
customerAddressRoutes.get('/:addressId',  authMiddleware, asyncHandler(getAddress));
customerAddressRoutes.put('/:addressId', updateValidation,  authMiddleware, asyncHandler(updateAddress));
customerAddressRoutes.delete('/:addressId',  authMiddleware, asyncHandler(deleteAddress));
customerAddressRoutes.patch('/:addressId/default',  authMiddleware, asyncHandler(setDefaultAddress));

export default customerAddressRoutes;