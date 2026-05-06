import { successResponse } from '../../utils/apiResponse';
import { getAddressById, getAddressesByCustomer,createAddressServices,deleteAddress,setDefaultAddress,updateAddress } from './customerAddress.service';




export const getAddresses = async (req, res, next) => {
  try {
    const { customerId } = req.params;
    const addresses = await getAddressesByCustomer(customerId);
    successResponse(res, addresses, 'Addresses fetched successfully');
  } catch (err) {
    next(err);
  }
};

export const getAddress = async (req, res, next) => {
  try {
    const { customerId, addressId } = req.params;
    const address = await getAddressById(addressId, customerId);
    successResponse(res, address, 'Address fetched successfully');
  } catch (err) {
    next(err);
  }
};

export const createAddress = async (req, res, next) => {
  try {
    const { customerId } = req.params;
    const address = await createAddressServices(customerId, req.body);
    successResponse(res, address, 'Address created successfully', 201);
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/customers/:customerId/addresses/:addressId
 */
export const updateAddress = async (req, res, next) => {
  try {
    const { customerId, addressId } = req.params;
    const address = await updateAddress(addressId, customerId, req.body);
    successResponse(res, address, 'Address updated successfully');
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/customers/:customerId/addresses/:addressId
 */
export const deleteAddress = async (req, res, next) => {
  try {
    const { customerId, addressId } = req.params;
    await deleteAddress(addressId, customerId);
    successResponse(res, null, 'Address deleted successfully');
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/customers/:customerId/addresses/:addressId/default
 */
 export const setDefaultAddress = async (req, res, next) => {
  try {
    const { customerId, addressId } = req.params;
    const result = await setDefaultAddress(customerId, addressId);
    successResponse(res, result, 'Default address updated');
  } catch (err) {
    next(err);
  }
};

