// ==========================================================
// ADDRESS STORE (localStorage based - no backend addresses API yet)
// ==========================================================

const ADDRESS_KEY = "orgos_addresses";

export function getAddresses() {

    try {

        const raw = localStorage.getItem(ADDRESS_KEY);

        return raw ? JSON.parse(raw) : [];

    }

    catch (err) {

        return [];

    }

}

function saveAll(addresses) {

    localStorage.setItem(ADDRESS_KEY, JSON.stringify(addresses));

}

export function addAddress(address) {

    const addresses = getAddresses();

    const newAddress = {

        id: Date.now().toString(),
        fullName: address.fullName || "",
        mobile: address.mobile || "",
        addressLine: address.addressLine || "",
        city: address.city || "",
        state: address.state || "",
        pincode: address.pincode || "",
        isDefault: addresses.length === 0 ? true : !!address.isDefault

    };

    let updated = [...addresses, newAddress];

    if (newAddress.isDefault) {

        updated = updated.map(a =>

            a.id === newAddress.id ? a : { ...a, isDefault: false }

        );

    }

    saveAll(updated);

    return newAddress;

}

export function updateAddress(id, data) {

    let addresses = getAddresses().map(a =>

        a.id === id ? { ...a, ...data, id } : a

    );

    if (data.isDefault) {

        addresses = addresses.map(a =>

            a.id === id ? a : { ...a, isDefault: false }

        );

    }

    saveAll(addresses);

    return addresses;

}

export function deleteAddress(id) {

    const addresses = getAddresses().filter(a => a.id !== id);

    if (addresses.length > 0 && !addresses.some(a => a.isDefault)) {

        addresses[0].isDefault = true;

    }

    saveAll(addresses);

    return addresses;

}

export function setDefaultAddress(id) {

    const addresses = getAddresses().map(a => ({

        ...a,
        isDefault: a.id === id

    }));

    saveAll(addresses);

    return addresses;

}

export function getDefaultAddress() {

    return getAddresses().find(a => a.isDefault) || null;

}
