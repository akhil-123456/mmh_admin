import React, { Component } from "react";
import { BootstrapTable, TableHeaderColumn } from "react-bootstrap-table";
import { Row, Col, Tooltip, OverlayTrigger, Modal } from "react-bootstrap";
import { Link } from "react-router-dom";
import API from "../../../../shared/admin-axios";
import { Formik, Field, Form } from "formik"; // for add/edit only
import * as Yup from "yup"; // for add/edit only
import swal from "sweetalert";
import Layout from "../../layout/Layout";
import { htmlDecode } from "../../../../shared/helper";
// import Switch from "react-switch";
import { showErrorMessage } from "../../../../shared/handle_error";
import dateFormat from "dateformat";
// import { Editor } from "@tinymce/tinymce-react";

import LoaderSpinner from "../../Loader/loader";
/*For Tooltip*/

function LinkWithTooltip({ id, children, href, tooltip, clicked }) {
  return (
    <OverlayTrigger
      overlay={<Tooltip id={id}>{tooltip}</Tooltip>}
      placement="left"
      delayShow={300}
      delayHide={150}
      trigger={["hover"]}
    >
      <Link to={href} onClick={clicked}>
        {children}
      </Link>
    </OverlayTrigger>
  );
}
/*For Tooltip*/

const actionFormatter = (refObj) => (cell, row) => {
  return (
    <div className="actionStyle">
      <LinkWithTooltip
        tooltip="Click to edit"
        href="#"
        clicked={(e) => refObj.modalShowHandler(e, cell, row)}
        id="tooltip-1"
      >
        <i className="far fa-edit" />
      </LinkWithTooltip>
    </div>
  );
};

const __htmlDecode = (refObj) => (cell) => {
  return htmlDecode(cell);
};
const __htmlDecodeDescription = (refObj) => (cell) => {
  if (cell.length > 100) {
    return htmlDecode(cell.substring(0, 100).concat("...."));
  } else {
    return htmlDecode(cell);
  }
};

const setDate = (refOBj) => (cell) => {
  if (cell && cell != "") {
    var mydate = new Date(cell);
    return dateFormat(mydate, "dd-mm-yyyy");
  } else {
    return "---";
  }
};

const initialValues = {
  title: "",
  price_monthly: "",
  price_yearly: "",
};

class Price extends Component {
  constructor(props) {
    super(props);
    this.state = {
      price: [],
      priceDetails: {},
      isLoading: true,
      showModal: false,
      thumbNailModal: false,

      thumbNailModal: false,
      search_text: "",
      status: "",
    };
  }

  componentDidMount() {
    this.getPriceList();
  }

  getPriceList = () => {
    API.get(`/api/adm/price`)
      .then((res) => {
        this.setState({
          price: res.data.data,
          isLoading: false,
        });
      })
      .catch((err) => {
        this.setState({
          isLoading: false,
        });
        showErrorMessage(err, this.props);
      });
  };

  modalCloseHandler = () => {
    this.setState({ price_id: 0 });
    this.setState({ showModal: false });
    this.setState({
      price_id: 0,
      priceDetails: {},
      validationMessage: "",
    });
  };

  modalShowHandler = (event, id, row) => {
    if (id) {
      event.preventDefault();
      this.setState({
        showModal: true,
        price_id: id,
        priceDetails: row,
      });
    } else {
      this.setState({
        showModal: true,
        price_id: 0,
        priceDetails: {},
      });
    }
  };

  handleSubmitEvent = (values, actions) => {
    let url = "";
    let method = "";

    const post_data = {
      price_monthly: Math.round(Number(values.price_monthly)).toString(),
      price_yearly: Math.round(Number(values.price_yearly)).toString(),
    };

    if (this.state.price_id > 0) {
      url = `/api/adm/update_price/${this.state.price_id}`;
      method = "PUT";
    } else {
      url = `/api/adm/update_price`;
      method = "POST";
    }
    API({
      url: url,
      method: method,
      data: post_data,
    })
      .then((res) => {
        this.setState({ showModal: false });
        swal({
          closeOnClickOutside: false,
          title: "Success",
          text:
            method === "PUT" ? "Updated Successfully" : "Added Successfully",
          icon: "success",
        }).then(() => {
          this.getPriceList();
        });
      })
      .catch((err) => {
        this.setState({ closeModal: true, showModalLoader: false });
        if (err.data.status === 3) {
          showErrorMessage(err, this.props);
        } else {
          actions.setErrors(err.data.errors);
          actions.setSubmitting(false);
        }
      });
  };

  render() {
    const { priceDetails } = this.state;

    const newInitialValues = Object.assign(initialValues, {
      title: priceDetails.title ? htmlDecode(priceDetails.title) : "",
      price_monthly: priceDetails.price_monthly
        ? htmlDecode(priceDetails.price_monthly.toString())
        : "",
      price_yearly: priceDetails.price_yearly
        ? htmlDecode(priceDetails.price_yearly.toString())
        : "",
    });

    let validateStopFlag = Yup.object().shape({
      title: Yup.string().required("Please enter the title"),
      price_monthly: Yup.number().required("please enter only number"),
      price_yearly: Yup.number().required("please enter only number"),
    });

    return (
      <>
        {this.state.isLoading ? (
          <LoaderSpinner />
        ) : (
          <Layout {...this.props}>
            <div className="content-wrapper">
              {/* {console.log(this.state.price[0].price_yearly)} */}
              <section className="content-header">
                <div className="row">
                  <div class="col-lg-12 col-sm-12 col-xs-12">
                    <h1>
                      Manage Subscription Price<small></small>
                    </h1>
                  </div>
                </div>
              </section>
              <section className="content mt-5">
                <div className="box">
                  <div className="box-body">
                    <BootstrapTable data={this.state.price}>
                      <TableHeaderColumn
                        isKey
                        dataField="title"
                        dataFormat={__htmlDecode(this)}
                      >
                        Title
                      </TableHeaderColumn>
                      <TableHeaderColumn
                        dataField="price_monthly"
                        // dataFormat={__htmlDecodeDescription(this)}
                      >
                        {console.log(this.state.price[0].price_monthly)}
                        Price monthly
                      </TableHeaderColumn>
                      {/*  */}
                      <TableHeaderColumn
                        dataField="price_yearly"
                        //   dataFormat={__htmlDecodeDescription(this)}
                      >
                        Price yearly
                      </TableHeaderColumn>

                      <TableHeaderColumn
                        dataField="updated_at"
                        dataFormat={setDate(this)}
                      >
                        updated at
                      </TableHeaderColumn>

                      <TableHeaderColumn
                        dataField="id"
                        dataFormat={actionFormatter(this)}
                        dataAlign=""
                      >
                        Action
                      </TableHeaderColumn>
                    </BootstrapTable>

                    {/* ======= Add/Edit FAQ Modal ======== */}
                    <Modal
                      show={this.state.showModal}
                      onHide={() => this.modalCloseHandler()}
                      backdrop="static"
                    >
                      <Formik
                        initialValues={newInitialValues}
                        validationSchema={validateStopFlag}
                        onSubmit={this.handleSubmitEvent}
                      >
                        {({
                          values,
                          errors,
                          touched,
                          isValid,
                          isSubmitting,
                          setFieldValue,
                        }) => {
                          return (
                            <Form>
                              <Modal.Header closeButton>
                                <Modal.Title>Edit Price</Modal.Title>
                              </Modal.Header>
                              <Modal.Body>
                                <div className="contBox">
                                  <Row>
                                    <Col xs={12} sm={12} md={12}>
                                      {console.log("values>>", values)}
                                      <div className="form-group">
                                        <label>
                                          Title
                                          <span className="impField">*</span>
                                        </label>
                                        <Field
                                          name="title"
                                          type="text"
                                          className={`form-control`}
                                          placeholder="Enter question"
                                          autoComplete="off"
                                          disabled
                                          value={values.title}
                                        />
                                        {errors.price && touched.price ? (
                                          <span className="errorMsg">
                                            {errors.price}
                                          </span>
                                        ) : null}
                                      </div>
                                    </Col>
                                  </Row>
                                  <Row>
                                    <Col xs={12} sm={12} md={12}>
                                      <div className="form-group">
                                        <label>
                                          Price monthly
                                          <span className="impField">*</span>
                                        </label>
                                        <Field
                                          name="price_monthly"
                                          type="text"
                                          className={`form-control`}
                                          placeholder="Enter price"
                                          autoComplete="off"
                                          value={values.price_monthly}
                                        />
                                        {errors.price_monthly &&
                                        touched.price_monthly ? (
                                          <span className="errorMsg">
                                            {errors.price_monthly}
                                          </span>
                                        ) : null}
                                      </div>
                                    </Col>
                                    <Col xs={12} sm={12} md={12}>
                                      <div className="form-group">
                                        <label>
                                          Price yearly
                                          <span className="impField">*</span>
                                        </label>
                                        <Field
                                          name="price_yearly"
                                          type="text"
                                          className={`form-control`}
                                          placeholder="Enter price"
                                          autoComplete="off"
                                          value={values.price_yearly}
                                        />
                                        {errors.price_yearly &&
                                        touched.price_yearly ? (
                                          <span className="errorMsg">
                                            {errors.price_yearly}
                                          </span>
                                        ) : null}
                                      </div>
                                    </Col>
                                  </Row>
                                </div>
                              </Modal.Body>
                              <Modal.Footer>
                                <button
                                  className={`btn btn-success btn-sm ${
                                    isValid ? "btn-custom-green" : "btn-disable"
                                  } m-r-10`}
                                  type="submit"
                                  disabled={
                                    isValid
                                      ? isSubmitting
                                        ? true
                                        : false
                                      : true
                                  }
                                >
                                  {this.state.price_id > 0
                                    ? isSubmitting
                                      ? "Updating..."
                                      : "Update"
                                    : isSubmitting
                                    ? "Submitting..."
                                    : "Submit"}
                                </button>
                                <button
                                  onClick={(e) => this.modalCloseHandler()}
                                  className={`btn btn-danger btn-sm`}
                                  type="button"
                                >
                                  Close
                                </button>
                              </Modal.Footer>
                            </Form>
                          );
                        }}
                      </Formik>
                    </Modal>
                  </div>
                </div>
              </section>
            </div>
          </Layout>
        )}
      </>
    );
  }
}
export default Price;
