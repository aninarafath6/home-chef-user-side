import React, { useState, useEffect, useRef } from "react";
import "./place_order.css";
import { Link, Redirect } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import RazorPay from "./fuctions/razorpay";
import swal from 'sweetalert';


const Place_order = (props) => {
  const notify = (data, type) => {
    toast.warn(data, {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  };

  const [total, setTotal] = useState(0);
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState(0);
  const [houseNo, setHouseNo] = useState(0);
  const [road, setRoad] = useState("");
  const [landmark, setLandmark] = useState("");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [pincode, setPincode] = useState(0);
  const [payment, setPayment] = useState("");
  const addressRef = useRef();
  const paymentRef = useRef();
  const formRef = useRef();
  const [orderPlaced, setOrderPlaced] = useState();
  const [logged, setLogged] = useState();

  useEffect(() => {
    let token = localStorage.getItem("user_token");
    const config = {};
    if (token !== null) {
      config.headers = { authorazation: "Bearer " + token };
    }

    axios.get("user/getTotalPrice", config).then((res) => {
      setLogged(res.data.loggin);
      if(res.data.total){

        setTotal(res.data.total.total);
      }
    });
  });
  const onOrderFormSubmitHandiler = (e) => {
    e.preventDefault();

    const address = {
      name: fullName,
      mobile: phoneNumber,
      houseNo: houseNo,
      road: road,
      landmark: landmark,
      state: state,
      city: city,
      pincode: pincode,
      payment: payment,
    };
    let token = localStorage.getItem("user_token");
    const config = {};
    if (token !== null) {
      config.headers = { authorazation: "Bearer " + token };
    }

    axios.post("user/place-order", address, config).then((res) => {
      console.log(res);
      if (res.data.codSuccess) {
        console.log("success");
        setOrderPlaced(true);
      } else {
        console.log("pending");

        displayRazorPay(res.data.order);
      }
    });
  };

  const toAddressHandiler = () => {
    addressRef.current.classList.add("hideAdrssForm");
    paymentRef.current.classList.add("vewPaymet");
  };

  function loadScript() {
    return new Promise(async (resolve, reject) => {
      const script = await document.createElement("script");
      script.src = await "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => {
        resolve({ status: true });
      };
      script.onerror = () => {
        reject({ status: false });
      };
      document.body.appendChild(script);
    });
  }
  async function displayRazorPay(order) {
    loadScript().then((response) => {
      console.log("hio");
      var options = {
        key:"rzp_test_AGrgXxsDBHcnsO",  // Enter the Key ID generated from the Dashboard
        amount: order.amount, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
        currency: "INR",
        name: "Home Chef",
        description: "Test Transaction",
        image: "https://example.com/your_logo",
        order_id: order.id, //This is a sample Order ID. Pass the `id` obtained in the response of Step 1
        handler: function (response) {
          swal({
            title: "success!",
            text: "Payment successfully !",
            icon: "success",
  
          });
          razorPay_verifyPayment(response, order);
        },
        prefill: {
          name: "Gaurav Kumar",
          email: "gaurav.kumar@example.com",
          contact: "9999999999",
        },
        notes: {
          address: "Razorpay Corporate Office",
        },
        theme: {
          color: "#3399cc",
        },
      };
      var rzp1 = new window.Razorpay(options);
      rzp1.on("payment.failed", function (response) {
        swal({
          title: "Payment failed!",
          text: "please tray agin!",
          icon: "error",

        });
        swal({
          title: response.error.description,
          text: "",
          icon: "warning",

        });
       
      });
      rzp1.open();
    });
  }

  function razorPay_verifyPayment(payment, order) {
    console.log("hisjxnjsx");
    let data = {
      payment: payment,
      order: order,
    };
    let token = localStorage.getItem("user_token");
    const config = {};
    if (token !== null) {
      config.headers = { authorazation: "Bearer " + token };
    }

    axios
      .post("user/razorPay-verify-payment", data, config)
      .then((response) => {
        setOrderPlaced(response.data.status);
      });
  }

  return (
    <>
      {logged === false ? (
        <>
          <Redirect to="/login" />
        </>
      ) : (
        <>
          {orderPlaced ? (
            <>
              <Redirect to="/Order_success" />
            </>
          ) : (
            <>
              <ToastContainer />
              <div className="plac_bc">
                <div className="plac_overlay">
                  <div className="Place_order container">
                    <form
                      ref={formRef}
                   
                      method="post"
                      onSubmit={onOrderFormSubmitHandiler}
                      className="addressForm "
                    >
                      <div
                        ref={addressRef}
                        id="addressWrapper"
                        className="addressWrapper "
                      >
                        <h3 className="deliveryAdress">DELIVERY ADDRESS</h3>
                        <div className="width-full">
                          <input
                            onChange={(e) => setFullName(e.target.value)}
                            required
                            type="text"
                            name="fullName"
                            id="fullName"
                            className="width-full adressInp"
                          />
                          <label htmlFor="fullName" className="adressLabel">
                            Full Name (Required)*
                          </label>
                          <br />
                        </div>
                        <div className="width-full">
                          <input
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            required
                            type="number"
                            name="phoneNumber"
                            id="phoneNumber"
                            className="width-full adressInp"
                          />
                          <label htmlFor="phoneNumber" className="adressLabel">
                            Phone number (Required)*
                          </label>
                          <br />
                        </div>
                        <div className="width-full">
                          <input
                            onChange={(e) => setHouseNo(e.target.value)}
                            required
                            type="number"
                            type="search"
                            name="HouseNo"
                            id="HouseNo"
                            className="width-full adressInp"
                          />
                          <label htmlFor="HouseNo" className="adressLabel">
                            House No (Required)*
                          </label>
                          <br />
                        </div>
                        <div className="width-full">
                          <input
                            onChange={(e) => setRoad(e.target.value)}
                            required
                            type="search"
                            name="Road"
                            id="Road"
                            className="width-full adressInp"
                          />
                          <label htmlFor="Road" className="adressLabel">
                            Road name,Area (Required)*
                          </label>
                          <br />
                        </div>
                        <div className="width-full">
                          <input
                            onChange={(e) => setLandmark(e.target.value)}
                            required
                            type="text"
                            name="Landmark"
                            id="Landmark"
                            className="width-full adressInp"
                          />
                          <label className="adressLabel" htmlFor="Landmark">
                            Landmark (optional)
                          </label>
                          <br />
                        </div>
                        <div className="width-full state">
                          <div className="width-half">
                            <input
                              required
                              onChange={(e) => setState(e.target.value)}
                              type="text"
                              name="State"
                              id="State"
                              className="width-full adressInp"
                            />
                            <label className="adressLabel" htmlFor="State">
                              State (Required)*
                            </label>
                            <br />
                          </div>
                          <div className="width-half city">
                            <input
                              required
                              onChange={(e) => setCity(e.target.value)}
                              type="text"
                              name="City"
                              id="State"
                              className="width-full adressInp "
                            />
                            <label
                              className="adressLabel city-label"
                              htmlFor="State"
                            >
                              City (Required)*
                            </label>
                            <br />
                          </div>
                        </div>

                        <div className="width-full state">
                          <div className="width-half">
                            <input
                              onChange={(e) => setPincode(e.target.value)}
                              required
                              type="number"
                              name="Pincode "
                              id="Pincode"
                              className="adressInp width-full"
                            />
                            <label className="adressLabel " htmlFor="Pincode">
                              Pincode (Required)*
                            </label>
                            <br />
                          </div>
                        </div>
                        <Link
                          onClick={toAddressHandiler}
                          className="btn btn-success ctnBTn width-full"
                        >
                          CONTINEU
                        </Link>
                      </div>
                      <div ref={paymentRef} className="payment  d">
                        <h4 className="pH4">TOTAL AMOUNT:Rs.₹{total}</h4>
                        <hr />
                        <p className="choosePayment">Choose Payment Option</p>
                        <div className="pey">
                          <div className="flex">
                            <input
                              onChange={(e) => setPayment(e.target.value)}
                              value="cod"
                              type="radio"
                              name="paymentMd"
                              id="cod"
                            />
                            <label className="pLabel" htmlFor="cod">
                              COD
                            </label>
                          </div>
                          <div className="flex">
                            <input
                              onChange={(e) => setPayment(e.target.value)}
                              value="RazorPay"
                              type="radio"
                              name="paymentMd"
                              id="PAYTM"
                            />
                            <label className="pLabel" htmlFor="PAYTM">
                              RazorPay
                            </label>
                          </div>
                        </div>
                        <div className="width-full">
                          <button
                            type="submit"
                            id="checkout-btn"
                            className="btn btn-success ctnBTn checkout-btn"
                          >
                            CHECKOUT
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </>
  );
};
export default Place_order;
