import api from "../../api/axios";

export const createPaymentIntent = (courseId) =>
    api.post(`/api/Payment/create-intent/${courseId}`);

export const paymentCallback = (data, hmac) =>
    api.post("/api/Payment/callback", data, { params: { hmac } });

export const getPaymentStatus = (success) =>
    api.get("/api/Payment/status", { params: { success } });

export const generatePaymobUrl = (clientSecret) => {
    const publicKey = "egy_pk_test_t2avAiMwdHc6DfAGATeIjARLjYCdzqSI";
    return `https://accept.paymob.com/unifiedcheckout/?publicKey=${publicKey}&clientSecret=${clientSecret}`;
};