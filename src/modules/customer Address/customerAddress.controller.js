import { successResponse } from '../../utils/apiResponse.js';
import { getAddressById, getAddressesByCustomer, createAddressServices, getCountriesService, updateAddressServices, deleteAddressServices, setDefaultAddressServices, getZonesByCountryService } from './customerAddress.service.js';




export const getAddresses = async (req, res) => {

    const customerId  = req.customer.customer_id
    const addresses = await getAddressesByCustomer(customerId);
   return successResponse(res, 200, 'Addresses fetched successfully', addresses);

};

export const getAddress = async (req, res) => {

    const { customerId, addressId } = req.params;
    const address = await getAddressById(addressId, customerId);
   return successResponse(res, 200, 'Address fetched successfully', address);

};

export const createAddress = async (req, res) => {

    const customerId  = req.customer.customer_id
    console.log("Creating address for customer:", customerId);
    const address = await createAddressServices(customerId, req.body);
   return successResponse(res, 201, 'Address created successfully', address);

};


export const updateAddress = async (req, res) => {

    const { customerId, addressId } = req.params;
    const address = await updateAddressServices(addressId, customerId, req.body);
   return successResponse(res, 200, 'Address updated successfully', address);

};

export const deleteAddress = async (req, res) => {

    const { customerId, addressId } = req.params;
    await deleteAddressServices(addressId, customerId);
   return successResponse(res, 200, 'Address deleted successfully');

};


export const setDefaultAddress = async (req, res) => {

    const { customerId, addressId } = req.params;
    const result = await setDefaultAddressServices(customerId, addressId);
   return successResponse(res, 200, 'Default address updated', result);

};


export const getCountries = async (req, res) => {
    const countries = await getCountriesService();
   return successResponse(res,200,'Countries fetched successfully',countries);
}

export const getZones = async (req, res) => {
    const { countryId } = req.params;   
    const zone = await getZonesByCountryService(countryId);
   return successResponse(res,200,'Zones fetched successfully',zone);
}