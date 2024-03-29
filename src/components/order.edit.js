import React, { useState, useEffect } from "react";
import { useHistory, useParams, Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import moment from "moment";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  OverlayTrigger,
  Tooltip,
  Alert,
} from "react-bootstrap";
import csc from "country-state-city";
import { FaEdit } from "react-icons/fa";
import { MdLiveHelp } from "react-icons/md";

import { useFormSelect } from "../utils/form-select.util";
import { useFormSwitch } from "../utils/form-switch.util";
import {
  verifyTokenAsync,
  userLogoutAsync,
} from "../actions/auth-async.action";
import { setAuthToken } from "../services/auth.service";
import { useFormInput } from "../utils/form-input.util";
import { orderGetService, orderUpdateService } from "../services/order.service";
import BreadcrumSection from "./sections/breadcrumb.section";
import { PageLoading } from "../utils/page-status.util";

export default function OrderEdit() {
  /*
   * Private Page Token Verification Module.
   */
  const auth_obj = useSelector((state) => state.auth);
  const { token, expiredAt } = auth_obj;
  const dispatch = useDispatch();
  useEffect(() => {
    setAuthToken(token);
    const verifyTokenTimer = setTimeout(() => {
      dispatch(verifyTokenAsync(true));
    }, moment(expiredAt).diff() - 10 * 1000);
    return () => {
      clearTimeout(verifyTokenTimer);
    };
  }, [expiredAt, token, dispatch]);
  /* ----------------------- */

  const { id } = useParams();
  const [order, setOrder] = useState({
    number: "",
    billing: {
      first_name: "",
      last_name: "",
      address_1: "",
      address_2: "",
      city: "",
      state: "",
      postcode: "",
      country: "US",
    },
    shipping: {
      first_name: "",
      last_name: "",
      address_1: "",
      address_2: "",
      city: "",
      state: "",
      postcode: "",
      country: "US",
    },
    line_items: [],
  });

  const history = useHistory();
  const [pageError, setPageError] = useState("");
  const [pageLoading, setPageLoading] = useState(true);
  const [showThankyou, setShowThankyou] = useState(false);
  const [validated, setValidated] = useState(false);

  const billing_first_name = useFormInput(order.billing.first_name);
  const billing_last_name = useFormInput(order.billing.last_name);
  const billing_address_1 = useFormInput(order.billing.address_1);
  const billing_address_2 = useFormInput(order.billing.address_2);
  const billing_city = useFormInput(order.billing.city);
  const billing_state = useFormInput(order.billing.state);
  const billing_postcode = useFormInput(order.billing.postcode);
  const billing_country = useFormInput(order.billing.country);
  const shipping_first_name = useFormInput(order.shipping.first_name);
  const shipping_last_name = useFormInput(order.shipping.last_name);
  const shipping_address_1 = useFormInput(order.shipping.address_1);
  const shipping_address_2 = useFormInput(order.shipping.address_2);
  const shipping_city = useFormInput(order.shipping.city);
  const shipping_state = useFormInput(order.shipping.state);
  const shipping_postcode = useFormInput(order.shipping.postcode);
  const shipping_country = useFormInput(order.shipping.country);

  const sameAsShipping = useFormSwitch(false);

  const status = useFormSelect(
    order.status === undefined ? "processing" : order.status
  );

  const [showItemsForm, setShowItemsForm] = useState(false);
  const [items, setItems] = useState([]);
  const [updatedItems, setUpdatedItems] = useState([]);

  useEffect(() => {
    async function getData() {
      const orderData = await orderGetService(id);
      if (orderData.error) {
        dispatch(userLogoutAsync());
      } else {
        setOrder(orderData.data);
        setItems(orderData.data.line_items);
        setUpdatedItems(orderData.data.line_items);
      }
      setPageLoading(false);
    }
    getData();
  }, [dispatch, id]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const form = e.currentTarget;
    if (form.checkValidity() === false) {
      e.stopPropagation();
    } else {
      const order = {
        status: status.selected,
        shipping: {
          first_name: shipping_first_name.value,
          last_name: shipping_last_name.value,
          address_1: shipping_address_1.value,
          address_2: shipping_address_2.value,
          city: shipping_city.value,
          state: shipping_state.value,
          postcode: shipping_postcode.value,
          country: shipping_country.value,
        },
        billing: {
          first_name: sameAsShipping.checked
            ? shipping_first_name.value
            : billing_first_name.value,
          last_name: sameAsShipping.checked
            ? shipping_last_name.value
            : billing_last_name.value,
          address_1: sameAsShipping.checked
            ? shipping_address_1.value
            : billing_address_1.value,
          address_2: sameAsShipping.checked
            ? shipping_address_2.value
            : billing_address_2.value,
          city: sameAsShipping.checked
            ? shipping_city.value
            : billing_city.value,
          state: sameAsShipping.checked
            ? shipping_state.value
            : billing_state.value,
          postcode: sameAsShipping.checked
            ? shipping_postcode.value
            : billing_postcode.value,
          country: sameAsShipping.checked
            ? shipping_country.value
            : billing_country.value,
        },
        line_items: updatedItems,
      };

      async function fetchData() {
        setPageLoading(true);

        const result = await orderUpdateService(id, {
          ...order,
          auth_user: auth_obj.user,
        });
        setOrder((order) => ({ ...order, ...result.data }));
        setShowThankyou(true);
        setPageLoading(false);
      }
      fetchData();
    }

    setValidated(true);
  };

  const ThankyouPopup = () => {
    return (
      <>
        {showThankyou && (
          <div
            className="position-absolute w-100 h-100"
            style={{ zIndex: "1000", top: "0", left: "0", minHeight: "100vh" }}
          >
            <div
              className="d-flex flex-column justify-content-center align-items-center w-100 h-100 px-3"
              style={{
                backgroundColor: "rgba(255, 255, 255, .8)",
              }}
            >
              <Card className="shadow" style={{ maxWidth: "500px" }}>
                <Card.Header className="bg-info text-white">
                  <h5 className="m-0 text-center">Sucess</h5>
                </Card.Header>

                <Card.Body>
                  <p className="text-muted">
                    The order has been updated successfully.
                  </p>
                  <Link className="btn btn-primary" to="/orders">
                    Order List
                  </Link>

                  <Button
                    variant="white"
                    onClick={() => setShowThankyou(false)}
                  >
                    Continue Editing
                  </Button>
                </Card.Body>
              </Card>
            </div>
          </div>
        )}
      </>
    );
  };

  const PageError = (props) => {
    return (
      <>
        {pageError && (
          <div
            className="position-absolute w-100 h-100"
            style={{ zIndex: "1000", top: "0", left: "0", minHeight: "100vh" }}
          >
            <div
              className="d-flex flex-column justify-content-center align-items-center w-100 h-100 px-3"
              style={{
                backgroundColor: "rgba(255, 255, 255, .8)",
              }}
            >
              <Card className="shadow" style={{ maxWidth: "500px" }}>
                <Card.Header
                  style={{ backgroundColor: "rgba(3, 169, 244, 0.6)" }}
                >
                  <h5 className="m-0 text-center">Error</h5>
                </Card.Header>

                <Card.Body>
                  <p className="text-muted">{pageError}</p>

                  <Button variant="white" onClick={() => setPageError("")}>
                    Close
                  </Button>
                </Card.Body>
              </Card>
            </div>
          </div>
        )}
      </>
    );
  };

  const handleitemsUpdate = (e) => {
    let updatedItemsArray = [];

    const checkedCheckboxes = document.getElementsByName("item");

    checkedCheckboxes.forEach((checkedCheckbox) => {
      if (checkedCheckbox.checked) {
        for (let i = 0; i < items.length; i++) {
          if (items[i].id.toString() === checkedCheckbox.value.toString()) {
            updatedItemsArray.push(items[i]);
            break;
          }
        }
      }
    });

    items.forEach((item) => {
      let included = false;
      updatedItemsArray.forEach((updatedItem) => {
        if (item.id.toString() === updatedItem.id.toString()) included = true;
      });

      if (!included) {
        updatedItemsArray.push({ id: item.id, quantity: 0 });
      }
    });

    setUpdatedItems(updatedItemsArray);
  };

  const LineItems = (items) => {
    return items.map((item, index) => {
      let checked = false;
      updatedItems.forEach((updatedItem) => {
        if (
          parseInt(item.id) === parseInt(updatedItem.id) &&
          updatedItem.quantity !== 0
        ) {
          checked = true;
        }
      });

      return (
        <div key={index}>
          <Form.Check
            className="mr-5"
            type="checkbox"
            name="item"
            value={item.id}
            label={item.name}
            checked={!!checked}
            onChange={handleitemsUpdate}
          />
        </div>
      );
    });
  };

  const ItemsForm = (props) => {
    return (
      <>
        {showItemsForm && (
          <div
            className="position-absolute w-100 h-100"
            style={{ zIndex: "1000", top: "0", left: "0", minHeight: "100vh" }}
          >
            <div
              className="d-flex flex-column justify-content-center align-items-center w-100 h-100 px-3"
              style={{
                backgroundColor: "rgba(255, 255, 255, .8)",
              }}
            >
              <Card className="shadow" style={{ maxWidth: "500px" }}>
                <Card.Header
                  style={{ backgroundColor: "rgba(3, 169, 244, 0.6)" }}
                >
                  <h5 className="m-0 text-center">Edit Order Items</h5>
                </Card.Header>

                <Card.Body>
                  <Alert variant="info">Uncheck to remove the item.</Alert>
                  <Form className="m-2">{LineItems(props.items)}</Form>

                  <Button
                    variant="outline-info"
                    onClick={() => setShowItemsForm(false)}
                  >
                    Save
                  </Button>
                </Card.Body>
              </Card>
            </div>
          </div>
        )}
      </>
    );
  };

  const handleCancel = (e) => {
    e.preventDefault();
    history.push("/orders");
  };

  const CountryOptions = (props) => (
    <option value={props.sortname}>{props.name}</option>
  );

  const listCountries = () => {
    return csc.getAllCountries().map(function (country, index) {
      return (
        <CountryOptions
          name={country.name}
          sortname={country.sortname}
          key={index}
        ></CountryOptions>
      );
    });
  };

  const Item = (props) => <p>{props.item.name}</p>;

  const itemList = (items) => {
    return items.map(function (item, index) {
      return <Item item={item} key={index} />;
    });
  };

  return (
    <>
      <BreadcrumSection
        breadcrumb={{
          parentPath: "Orders",
          parentLink: "/orders",
          activePath: "Edit Order",
        }}
      />

      <Container>
        <h1 className="m-5 text-center">Edit Order</h1>

        <Form
          autoComplete="off"
          noValidate
          validated={validated}
          onSubmit={handleSubmit}
        >
          <Container>
            <Card className="h-100 shadow">
              <Card.Header
                style={{ backgroundColor: "rgba(3, 169, 244, 0.6)" }}
              >
                <h5 className="m-0 text-center">Order Information</h5>
              </Card.Header>
              <Card.Body>
                {pageError && (
                  <div
                    className="d-flex flex-column position-absolute w-100 h-100"
                    style={{
                      top: "0",
                      left: "0",
                      backgroundColor: "rgba(255, 255, 255, .7)",
                      zIndex: "1",
                    }}
                  >
                    <p className="mt-5 pt-5 text-danger text-center">
                      {pageError}
                    </p>
                  </div>
                )}

                <Row>
                  <Col lg={6}>
                    <Form.Group>
                      <Form.Label>Order Number</Form.Label>
                      <p>{order.number}</p>
                    </Form.Group>

                    <Form.Group>
                      <Form.Label>Payment Method</Form.Label>
                      <p>{order.payment_method_title}</p>
                    </Form.Group>

                    <Form.Group>
                      <Form.Label>Tax</Form.Label>
                      <p>${order.total_tax}</p>
                    </Form.Group>

                    <Form.Group>
                      <Form.Label>Shipping</Form.Label>
                      <p>${order.shipping_total}</p>
                    </Form.Group>

                    <Form.Group>
                      <Form.Label>Shipping Method</Form.Label>
                      <p>
                        {order.shipping_lines !== undefined &&
                        order.shipping_lines.length > 0
                          ? order.shipping_lines[0].method_title
                          : " "}
                      </p>
                    </Form.Group>

                    <Form.Group>
                      <Form.Label>Order Total</Form.Label>
                      <p>${order.total}</p>
                    </Form.Group>

                    <hr />

                    <Form.Label className="w-100 d-flex">
                      <span>Line Items</span>

                      <span className="ml-2 mr-auto">
                        <OverlayTrigger
                          key="saveTags"
                          placement="top"
                          overlay={
                            <Tooltip id="tooltip-saveTags">
                              To change this order, change the status back to
                              pending.
                            </Tooltip>
                          }
                        >
                          <MdLiveHelp color="#33B5E5" />
                        </OverlayTrigger>
                      </span>

                      <span
                        className="ml-auto"
                        style={{ cursor: "pointer" }}
                        onClick={() => setShowItemsForm(true)}
                      >
                        <OverlayTrigger
                          key="editItems"
                          placement="top"
                          overlay={
                            <Tooltip id="tooltip-editItems">
                              Edit Order Items
                            </Tooltip>
                          }
                        >
                          <FaEdit color="#FF3547" />
                        </OverlayTrigger>
                      </span>
                    </Form.Label>
                    {itemList(updatedItems)}

                    <hr />

                    <Form.Group>
                      <Form.Label>Order Status</Form.Label>
                      <Form.Check
                        className="mb-2"
                        type="radio"
                        name="status"
                        value="pending"
                        label="Pending"
                        checked={status.selected === "pending"}
                        {...status}
                      />
                      <Form.Check
                        className="mb-2"
                        type="radio"
                        name="status"
                        value="on-hold"
                        label="On Hold"
                        checked={status.selected === "on-hold"}
                        {...status}
                      />
                      <Form.Check
                        className="mb-2"
                        type="radio"
                        name="status"
                        value="completed"
                        label="Completed"
                        checked={status.selected === "completed"}
                        {...status}
                      />
                      <Form.Check
                        className="mb-2"
                        type="radio"
                        name="status"
                        value="cancelled"
                        label="Cancelled"
                        checked={status.selected === "cancelled"}
                        {...status}
                      />
                      <Form.Check
                        className="mb-2"
                        type="radio"
                        name="status"
                        value="refunded"
                        label="Refunded"
                        checked={status.selected === "refunded"}
                        {...status}
                      />
                      <Form.Check
                        className="mb-2"
                        type="radio"
                        name="status"
                        value="failed"
                        label="Failed"
                        checked={status.selected === "failed"}
                        {...status}
                      />
                      <Form.Check
                        className="mb-2"
                        type="radio"
                        name="status"
                        value="trash"
                        label="Trash"
                        checked={status.selected === "trash"}
                        {...status}
                      />
                    </Form.Group>
                  </Col>

                  <Col lg={6}>
                    <Form.Label>Shipping Address</Form.Label>

                    <Form.Row>
                      <Form.Group as={Col}>
                        <Form.Control
                          required
                          id="shipping_first_name"
                          name="shipping_first_name"
                          type="text"
                          {...shipping_first_name}
                          placeholder="First Name"
                        />
                        <Form.Control.Feedback type="invalid">
                          Please provide a valid first name
                        </Form.Control.Feedback>
                      </Form.Group>

                      <Form.Group as={Col}>
                        <Form.Control
                          id="shipping_last_name"
                          name="shipping_last_name"
                          type="text"
                          {...shipping_last_name}
                          placeholder="Last Name"
                        />
                      </Form.Group>
                    </Form.Row>

                    <Form.Group>
                      <Form.Control
                        required
                        id="shipping_address_1"
                        name="shipping_address_1"
                        type="text"
                        {...shipping_address_1}
                        placeholder="Street Address 1"
                      />
                      <Form.Control.Feedback type="invalid">
                        Invalid street address.
                      </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group>
                      <Form.Control
                        id="shipping_address_2"
                        name="shipping_address_2"
                        type="text"
                        {...shipping_address_2}
                        placeholder="Street Address 2"
                      />
                    </Form.Group>

                    <Form.Row>
                      <Form.Group as={Col}>
                        <Form.Control
                          required
                          id="shipping_city"
                          name="shipping_city"
                          type="text"
                          {...shipping_city}
                          placeholder="City"
                        />
                        <Form.Control.Feedback type="invalid">
                          Invalid city name.
                        </Form.Control.Feedback>
                      </Form.Group>

                      <Form.Group as={Col}>
                        <Form.Control
                          required
                          id="shipping_state"
                          name="shipping_state"
                          type="text"
                          {...shipping_state}
                          placeholder="State"
                        />
                        <Form.Control.Feedback type="invalid">
                          Invalid state name.
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Form.Row>

                    <Form.Row>
                      <Form.Group as={Col}>
                        <Form.Control
                          required
                          id="shipping_postcode"
                          name="shipping_postcode"
                          type="text"
                          {...shipping_postcode}
                          placeholder="Zip Code"
                        />
                        <Form.Control.Feedback type="invalid">
                          Invalid Zipcode.
                        </Form.Control.Feedback>
                      </Form.Group>

                      <Form.Group as={Col}>
                        <Form.Control
                          id="shipping_country"
                          name="shipping_country"
                          as="select"
                          {...shipping_country}
                        >
                          {listCountries(shipping_country.value)}
                        </Form.Control>
                      </Form.Group>
                    </Form.Row>

                    <hr />

                    <Form.Label>Billing Address</Form.Label>

                    <Form.Group>
                      <Form.Check
                        type="switch"
                        id="same-shipping"
                        label="Same as shipping address?"
                        {...sameAsShipping}
                      />
                    </Form.Group>

                    {!sameAsShipping.checked && (
                      <>
                        <Form.Row>
                          <Form.Group as={Col}>
                            <Form.Control
                              required
                              id="billing_first_name"
                              name="billing_first_name"
                              type="text"
                              {...billing_first_name}
                              placeholder="First Name"
                            />
                            <Form.Control.Feedback type="invalid">
                              Please provide a valid first name.
                            </Form.Control.Feedback>
                          </Form.Group>

                          <Form.Group as={Col}>
                            <Form.Control
                              id="billing_last_name"
                              name="billing_last_name"
                              type="text"
                              {...billing_last_name}
                              placeholder="Last Name"
                            />
                          </Form.Group>
                        </Form.Row>

                        <Form.Group>
                          <Form.Control
                            required
                            id="billing_address_1"
                            name="billing_address_1"
                            type="text"
                            {...billing_address_1}
                            placeholder="Stree Address 1"
                          />
                          <Form.Control.Feedback type="invalid">
                            Invalid street address.
                          </Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group>
                          <Form.Control
                            id="billing_address_2"
                            name="billing_address_2"
                            type="text"
                            {...billing_address_2}
                            placeholder="Stree Address 2"
                          />
                        </Form.Group>

                        <Form.Row>
                          <Form.Group as={Col}>
                            <Form.Control
                              required
                              id="billing_city"
                              name="billing_city"
                              type="text"
                              {...billing_city}
                              placeholder="City"
                            />
                            <Form.Control.Feedback type="invalid">
                              Invalid city name.
                            </Form.Control.Feedback>
                          </Form.Group>

                          <Form.Group as={Col}>
                            <Form.Control
                              required
                              id="billing_state"
                              name="billing_state"
                              type="text"
                              {...billing_state}
                              placeholder="State"
                            />
                          </Form.Group>
                          <Form.Control.Feedback type="invalid">
                            Invalid state name.
                          </Form.Control.Feedback>
                        </Form.Row>

                        <Form.Row>
                          <Form.Group as={Col}>
                            <Form.Control
                              required
                              id="billing_postcode"
                              name="billing_postcode"
                              type="text"
                              {...billing_postcode}
                              placeholder="Zip Code"
                            />
                            <Form.Control.Feedback type="invalid">
                              Invalid Zipcode.
                            </Form.Control.Feedback>
                          </Form.Group>

                          <Form.Group as={Col}>
                            <Form.Control
                              id="billing_country"
                              name="billing_country"
                              as="select"
                              {...billing_country}
                            >
                              {listCountries(billing_country.value)}
                            </Form.Control>
                          </Form.Group>
                        </Form.Row>
                      </>
                    )}
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            <Row>
              <Col className="d-flex pt-5">
                <Button className="m-0 mr-2" variant="primary" type="submit">
                  Update
                </Button>

                <Button className="m-0" variant="white" onClick={handleCancel}>
                  Cancel
                </Button>
              </Col>
            </Row>
          </Container>
        </Form>
      </Container>

      <PageLoading pageLoading={pageLoading} />
      <PageError />
      <ThankyouPopup />
      <ItemsForm items={items} />
    </>
  );
}
