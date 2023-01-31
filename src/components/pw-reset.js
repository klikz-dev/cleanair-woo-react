import React, { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Form, Alert, Button } from "react-bootstrap";

import { useFormInput } from "../utils/form-input.util";

import { passwordResetService } from "../services/pw-reset.service";

import logo from "./../assets/images/logo.png";

export default function AccountLogin() {
  const { id } = useParams();

  const [btnLabel, setBtnLabel] = useState("Reset");
  const [handleError, setHandleError] = useState("");

  const password = useFormInput("");
  const pwconfirm = useFormInput("");

  const handleForgot = async (e) => {
    e.preventDefault();

    setHandleError("");
    setBtnLabel("Processing...");

    if (password.value !== "" && password.value === pwconfirm.value) {
      var reset = await passwordResetService(id, password.value);
      if (reset.error) {
        setHandleError(`Password Reset failed. Please try again.`);
        setBtnLabel("Reset");
      } else {
        setHandleError("");
        setBtnLabel("Done!");
      }
    } else {
      setHandleError("Please input valid passwords.");
      setBtnLabel("Reset");
    }
  };

  return (
    <div
      className="row vh-100 vw-100 m-0"
      style={{
        backgroundColor: "#007cc3",
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='100%25' viewBox='0 0 1200 800'%3E%3Cdefs%3E%3CradialGradient id='a' cx='0' cy='800' r='800' gradientUnits='userSpaceOnUse'%3E%3Cstop offset='0' stop-color='%2304acff'/%3E%3Cstop offset='1' stop-color='%2304acff' stop-opacity='0'/%3E%3C/radialGradient%3E%3CradialGradient id='b' cx='1200' cy='800' r='800' gradientUnits='userSpaceOnUse'%3E%3Cstop offset='0' stop-color='%230042fd'/%3E%3Cstop offset='1' stop-color='%230042fd' stop-opacity='0'/%3E%3C/radialGradient%3E%3CradialGradient id='c' cx='600' cy='0' r='600' gradientUnits='userSpaceOnUse'%3E%3Cstop offset='0' stop-color='%233f77ff'/%3E%3Cstop offset='1' stop-color='%233f77ff' stop-opacity='0'/%3E%3C/radialGradient%3E%3CradialGradient id='d' cx='600' cy='800' r='600' gradientUnits='userSpaceOnUse'%3E%3Cstop offset='0' stop-color='%23007cc3'/%3E%3Cstop offset='1' stop-color='%23007cc3' stop-opacity='0'/%3E%3C/radialGradient%3E%3CradialGradient id='e' cx='0' cy='0' r='800' gradientUnits='userSpaceOnUse'%3E%3Cstop offset='0' stop-color='%2345c7ff'/%3E%3Cstop offset='1' stop-color='%2345c7ff' stop-opacity='0'/%3E%3C/radialGradient%3E%3CradialGradient id='f' cx='1200' cy='0' r='800' gradientUnits='userSpaceOnUse'%3E%3Cstop offset='0' stop-color='%234f38ff'/%3E%3Cstop offset='1' stop-color='%234f38ff' stop-opacity='0'/%3E%3C/radialGradient%3E%3C/defs%3E%3Crect fill='url(%23a)' width='1200' height='800'/%3E%3Crect fill='url(%23b)' width='1200' height='800'/%3E%3Crect fill='url(%23c)' width='1200' height='800'/%3E%3Crect fill='url(%23d)' width='1200' height='800'/%3E%3Crect fill='url(%23e)' width='1200' height='800'/%3E%3Crect fill='url(%23f)' width='1200' height='800'/%3E%3C/svg%3E")`,
        backgroundAttachment: "fixed",
        backgroundSize: "cover",
      }}
    >
      <div className="col d-flex justify-content-center">
        <div className="card" style={{ width: "500px", margin: "auto" }}>
          <div className="card-header text-center">
            <Link to="/">
              <img src={logo} width="220" height="auto" alt="C2 Keep" />
            </Link>
          </div>
          <div className="card-body">
            <h2 className="text-center mb-5">Reset your password</h2>

            <Form autoComplete="off" onSubmit={handleForgot}>
              <Form.Group>
                <Form.Label>Password</Form.Label>
                <Form.Control
                  autoComplete="off"
                  id="password"
                  type="password"
                  {...password}
                />
              </Form.Group>

              <Form.Group>
                <Form.Label>Confirm Password</Form.Label>
                <Form.Control
                  autoComplete="off"
                  id="pwconfirm"
                  type="password"
                  {...pwconfirm}
                />
              </Form.Group>

              <Button
                className="m-0 mr-2"
                variant="outline-primary"
                type="submit"
                disabled={btnLabel !== "Reset"}
              >
                {btnLabel}
              </Button>

              <Link to="/login" className="ml-3">
                Back to Login
              </Link>
              {handleError && (
                <Alert variant="danger" className="mt-3">
                  {handleError}
                </Alert>
              )}
            </Form>
          </div>
          <div className="card-footer text-right">
            <a
              href="https://www.cleanair.com"
              target="_blank"
              rel="noopener noreferrer"
              className="mx-2"
            >
              www.cleanair.com
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
