import React, { Component } from "react";
import { BootstrapTable, TableHeaderColumn } from "react-bootstrap-table";
import { Row, Col, Tooltip, OverlayTrigger, Modal } from "react-bootstrap";
import { Link } from "react-router-dom";
import API from "../../../shared/admin-axios";
import { Formik, Field, Form } from "formik"; // for add/edit only
import * as Yup from "yup"; // for add/edit only
import swal from "sweetalert";
import Layout from "../layout/Layout";
import { htmlDecode } from "../../../shared/helper";
import moment from "moment";
import "yup-phone-lite";

import Pagination from "react-js-pagination";
import { showErrorMessage } from "../../../shared/handle_error";
import dateFormat from "dateformat";
import LoaderSpinner from "../Loader/loader";
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
      {row.status == 1 ? (
        <LinkWithTooltip
          tooltip="Click to reply"
          href="#"
          clicked={(e) => refObj.modalShowHandler(e, cell, row)}
          id="tooltip-1"
        >
          <i className="far fa-edit" />
        </LinkWithTooltip>
      ) : (
        <LinkWithTooltip
          tooltip="Click to view"
          href="#"
          clicked={(e) => refObj.modalShowHandler(e, cell, row)}
          id="tooltip-1"
        >
          <i className="far fa-eye" />
        </LinkWithTooltip>
      )}

      <LinkWithTooltip
        tooltip="Click to delete"
        href="#"
        clicked={(e) => refObj.confirmDelete(e, cell)}
        id="tooltip-1"
      >
        <i className="far fa-trash-alt" />
      </LinkWithTooltip>
    </div>
  );
};

const __htmlDecode = (refObj) => (cell) => {
  return htmlDecode(cell);
};

const userStatus = (refObj) => (cell) => {
  if (cell === 0) {
    return <p style={{ color: "red" }}>Inactive</p>;
  } else if (cell === 1) {
    return <p style={{ color: "green" }}> Active</p>;
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
  name: "",
  email: "",
  phone: "",
  status: "",
};

class users extends Component {
  constructor(props) {
    super(props);
    this.state = {
      users: [],
      userDetails: {},
      isLoading: true,
      showModal: false,
      page_name: "",
      activePage: 1,
      totalCount: 0,
      itemPerPage: 20,
      thumbNailModal: false,
      showModalLoader: false,
      selectStatus: [
        { value: "1", label: "Active" },
        { value: "0", label: "Inactive" },
      ],
      thumbNailModal: false,
      search_text: "",
      status: "",
      startDate: "",
      endDate: "",
    };
  }

  componentDidMount() {
    this.getUsersList();
    this.setState({
      todayDate: moment(new Date()).format("YYYY-MM-DD"),
    });
  }

  handlePageChange = (pageNumber) => {
    this.setState({ activePage: pageNumber });
    this.getUsersList(pageNumber > 0 ? pageNumber : 1);
  };

  getUsersList = (page = 1) => {
    let search_text = this.state.search_text;
    let status = this.state.status;
    let startDate = this.state.startDate;
    let endDate = this.state.endDate;

    API.get(
      `/api/adm/user_list?page=${page}&search_text=${encodeURIComponent(
        search_text
      )}&status=${encodeURIComponent(status)}&start_date=${encodeURIComponent(
        startDate
      )}&end_date=${encodeURIComponent(endDate)}`
    )
      .then((res) => {
        this.setState({
          users: res.data.data,
          totalCount: res.data.count,
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

  userSearch = (e) => {
    e.preventDefault();

    const search_text = document.getElementById("search_text").value;
    const status = document.getElementById("status").value;
    const startDate = document.getElementById("startDate").value;
    const endDate = document.getElementById("endDate").value;

    if (startDate != "" && endDate != "") {
      if (startDate > endDate) {
        swal({
          title: "Alert!",
          text: "Invalid date range",
          icon: "warning",
        });
        this.setState({
          remove_search: true,
        });
        return false;
      }
    }

    if (
      search_text === "" &&
      status === "" &&
      endDate === "" &&
      startDate === ""
    ) {
      return false;
    }

    API.get(
      `/api/adm/user_list?page=1&search_text=${encodeURIComponent(
        search_text
      )}&status=${encodeURIComponent(status)}&start_date=${encodeURIComponent(
        startDate
      )}&end_date=${encodeURIComponent(endDate)}`
    )
      .then((res) => {
        this.setState({
          users: res.data.data,
          totalCount: res.data.count,
          isLoading: false,
          search_text: search_text,
          startDate: startDate,
          endDate: endDate,
          activePage: 1,
          status: status,
          remove_search: true,
        });
      })
      .catch((err) => {
        this.setState({
          isLoading: false,
        });
        showErrorMessage(err, this.props);
      });
  };

  clearSearch = () => {
    document.getElementById("search_text").value = "";
    document.getElementById("status").value = "";
    document.getElementById("startDate").value = "";
    document.getElementById("endDate").value = "";

    this.setState(
      {
        search_text: "",
        status: "",
        startDate: "",
        startDate: "",
        endDate: "",
        remove_search: false,
      },
      () => {
        this.setState({ activePage: 1 });
        this.getUsersList();
      }
    );
  };

  getIndividualUser(id, row) {
    this.setState({
      userDetails: row,
    });
  }

  modalCloseHandler = () => {
    this.setState({ user_id: 0 });
    this.setState({ showModal: false });
    this.setState({
      user_id: 0,
      userDetails: {},
      image: "",
      validationMessage: "",
    });
  };

  modalShowHandler = (event, id, row) => {
    if (id) {
      event.preventDefault();
      this.setState({ user_id: id });
      this.getIndividualUser(id, row);
      this.setState({ showModal: true });
    } else {
      this.setState({
        showModal: true,
        user_id: 0,
        userDetails: {},
        image: "",
      });
    }
  };

  handleSubmitEvent = (values, actions) => {
    console.log("values>>>", values);
    // return;
    const post_data = {
      name: values.name,
      phone: values.phone,
      status: values.status,
      email: values.email,
    };

    API({
      url: `/api/adm/update_user/${this.state.user_id}`,
      method: "PUT",
      data: post_data,
    })
      .then((res) => {
        this.setState({ showModal: false });
        swal({
          closeOnClickOutside: false,
          title: "Success",
          text: "Succesfully replied to the user",
          icon: "success",
        }).then(() => {
          this.getUsersList();
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

  confirmDelete = (event, id) => {
    event.preventDefault();
    swal({
      closeOnClickOutside: false,
      title: "Are you sure?",
      text: "Once deleted, you will not be able to recover this!",
      icon: "warning",
      buttons: true,
      dangerMode: true,
    }).then((willDelete) => {
      if (willDelete) {
        this.deleteUser(id);
      }
    });
  };

  deleteUser = (id) => {
    API.put(`/api/adm/user_list/${id}`)
      .then((res) => {
        swal({
          closeOnClickOutside: false,
          title: "Success",
          text: "Record deleted successfully.",
          icon: "success",
        }).then(() => {
          this.getUsersList(this.state.activePage);
        });
      })
      .catch((err) => {
        // showErrorMessage(err, this.props);

        if (err.data.status !== 1) {
          this.setState({ closeModal: true });
          showErrorMessage(err, this.props);
        }
      });
  };

  render() {
    const { userDetails, totalCount } = this.state;
    console.log("userDetails>>", userDetails);
    const newInitialValues = Object.assign(initialValues, {
      name: userDetails.name ? htmlDecode(userDetails.name) : "",
      email: userDetails.email ? htmlDecode(userDetails.email) : "",
      phone: userDetails.phone ? htmlDecode(userDetails.phone) : "",
      status: userDetails.status ? htmlDecode(String(userDetails.status)) : "",
    });

    let validateStopFlag = {};

    if (this.state.user_id > 0) {
      validateStopFlag = Yup.object().shape({
        name: Yup.string().required("Please enter the name"),
        email: Yup.string()
          .email("Please enter a valid email")
          .required("Please enter the email"),
        phone: Yup.string()
          .phone("IN", "Please enter a valid phone number")
          .required("Phone number is required"),

        status: Yup.string()
          .trim()
          .required("Please select status")
          .matches(/^[0|1]$/, "Invalid status selected"),
      });
    }

    return (
      <>
        {this.state.isLoading ? (
          <LoaderSpinner />
        ) : (
          <Layout {...this.props}>
            <div className="content-wrapper">
              <section className="content-header">
                <div className="row">
                  <div className="col-lg-12 col-sm-12 col-xs-12">
                    <h1>
                      Manage Users (Total:{totalCount})
                      <small />
                    </h1>
                  </div>

                  <div className="col-lg-12 col-sm-12 col-xs-12  topSearchSection">
                    <form className="form">
                      <label>Start Date</label> &nbsp;&nbsp;
                      <div className="">
                        <input
                          className="form-control"
                          type="date"
                          name="startDate"
                          id="startDate"
                          max={this.state.todayDate}
                        />
                      </div>{" "}
                      &nbsp;&nbsp;
                      <label>End Date</label> &nbsp;&nbsp;
                      <div className="">
                        <input
                          className="form-control"
                          type="date"
                          name="endDate"
                          id="endDate"
                          max={this.state.todayDate}
                        />
                      </div>
                      <div className="">
                        <input
                          className="form-control"
                          name="search_text"
                          id="search_text"
                          placeholder="Search"
                        />
                      </div>
                      <div className="">
                        <select
                          name="status"
                          id="status"
                          className="form-control"
                        >
                          <option value="">Select User Status</option>
                          {this.state.selectStatus.map((val) => {
                            return (
                              <option key={val.value} value={val.value}>
                                {val.label}
                              </option>
                            );
                          })}
                        </select>
                      </div>
                      <div className="">
                        <input
                          type="submit"
                          value="Search"
                          className="btn btn-warning btn-sm"
                          onClick={(e) => this.userSearch(e)}
                        />
                        {this.state.remove_search ? (
                          <a
                            onClick={() => this.clearSearch()}
                            className="btn btn-danger btn-sm"
                          >
                            {" "}
                            Remove{" "}
                          </a>
                        ) : null}
                      </div>
                      <div className="clearfix"></div>
                    </form>
                  </div>
                </div>
              </section>
              <section className="content">
                <div className="box">
                  <div className="box-body">
                    <BootstrapTable data={this.state.users}>
                      <TableHeaderColumn
                        isKey
                        dataField="name"
                        dataFormat={__htmlDecode(this)}
                      >
                        Name
                      </TableHeaderColumn>
                      <TableHeaderColumn
                        dataField="phone"
                        dataFormat={__htmlDecode(this)}
                      >
                        Phone No
                      </TableHeaderColumn>
                      <TableHeaderColumn
                        dataField="email"
                        dataFormat={__htmlDecode(this)}
                      >
                        Email
                      </TableHeaderColumn>

                      <TableHeaderColumn
                        dataField="created_at"
                        dataFormat={setDate(this)}
                      >
                        Registered On
                      </TableHeaderColumn>

                      <TableHeaderColumn
                        dataField="status"
                        dataFormat={userStatus(this)}
                      >
                        Status
                      </TableHeaderColumn>

                      <TableHeaderColumn
                        dataField="id"
                        dataFormat={actionFormatter(this)}
                        dataAlign=""
                      >
                        Action
                      </TableHeaderColumn>
                    </BootstrapTable>

                    {totalCount > 20 ? (
                      <Row>
                        <Col md={12}>
                          <div className="paginationOuter text-right">
                            <Pagination
                              activePage={this.state.activePage}
                              itemsCountPerPage={20}
                              totalItemsCount={totalCount}
                              itemClass="nav-item"
                              linkClass="nav-link"
                              activeClass="active"
                              onChange={this.handlePageChange}
                            />
                          </div>
                        </Col>
                      </Row>
                    ) : null}

                    {/* ======= Edit User Modal ======== */}
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
                        }) => {
                          return (
                            <Form>
                              <Modal.Header closeButton>
                                <Modal.Title>Edit User</Modal.Title>
                              </Modal.Header>
                              <Modal.Body>
                                <div className="contBox">
                                  <Row>
                                    <Col xs={12} sm={12} md={12}>
                                      <div className="form-group">
                                        <label>Name</label>
                                        <Field
                                          name="name"
                                          type="text"
                                          className={`form-control`}
                                          placeholder="Enter name"
                                          autoComplete="off"
                                          value={values.name}
                                        />
                                        {errors.name && touched.name ? (
                                          <span className="errorMsg">
                                            {errors.name}
                                          </span>
                                        ) : null}
                                      </div>
                                    </Col>
                                  </Row>
                                  <Row>
                                    <Col xs={6} sm={6} md={6}>
                                      <div className="form-group">
                                        <label>Email</label>
                                        <Field
                                          name="email"
                                          type="text"
                                          className={`form-control`}
                                          placeholder="Enter name"
                                          autoComplete="off"
                                          value={values.email}
                                        />
                                        {errors.email && touched.email ? (
                                          <span className="errorMsg">
                                            {errors.email}
                                          </span>
                                        ) : null}
                                      </div>
                                    </Col>
                                    <Col xs={6} sm={6} md={6}>
                                      <div className="form-group">
                                        <label>Phone No</label>
                                        <Field
                                          name="phone"
                                          type="text"
                                          className={`form-control`}
                                          placeholder="Enter name"
                                          autoComplete="off"
                                          value={values.phone}
                                        />
                                        {errors.phone && touched.phone ? (
                                          <span className="errorMsg">
                                            {errors.phone}
                                          </span>
                                        ) : null}
                                      </div>
                                    </Col>
                                  </Row>
                                  {console.log("values>>>", values)}
                                  <Row>
                                    <Col xs={12} sm={12} md={12}>
                                      <div className="form-group">
                                        <label>
                                          Status
                                          <span className="impField">*</span>
                                        </label>
                                        <Field
                                          name="status"
                                          component="select"
                                          className={`selectArowGray form-control`}
                                          autoComplete="off"
                                          value={values.status}
                                        >
                                          <option key="-1" value="">
                                            Select
                                          </option>
                                          {this.state.selectStatus.map(
                                            (val, i) => (
                                              <option key={i} value={val.value}>
                                                {val.label}
                                              </option>
                                            )
                                          )}
                                        </Field>
                                        {errors.status && touched.status ? (
                                          <span className="errorMsg">
                                            {errors.status}
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
                                  {this.state.user_id > 0
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
export default users;
