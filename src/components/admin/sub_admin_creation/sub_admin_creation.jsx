import React, { Component } from "react";
import { BootstrapTable, TableHeaderColumn } from "react-bootstrap-table";
import { Row, Col, Tooltip, OverlayTrigger, Modal } from "react-bootstrap";
import { Link } from "react-router-dom";
import API from "../../../shared/admin-axios";
import { Formik, Field, Form } from "formik"; // for add/edit only
import * as Yup from "yup"; // for add/edit only
import swal from "sweetalert";
import Layout from "../../admin/layout/Layout";
import { htmlDecode } from "../../../shared/helper";
import Switch from "react-switch";
import { showErrorMessage } from "../../../shared/handle_error";
import dateFormat from "dateformat";
import moment from "moment";
import Pagination from "react-js-pagination";

import LoaderSpinner from "../../admin/Loader/loader";
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
        tooltip="Click to view"
        href="#"
        clicked={(e) => refObj.modalShowHandlerOnlyView(e, cell, row)}
        id="tooltip-1"
      >
        <i className="far fa-eye" />
      </LinkWithTooltip>
      <LinkWithTooltip
        tooltip="Click to edit"
        href="#"
        clicked={(e) => refObj.modalShowHandler(e, cell, row)}
        id="tooltip-1"
      >
        <i className="far fa-edit" />
      </LinkWithTooltip>
      <LinkWithTooltip
        tooltip={"Click to change status"}
        href="#"
        id="tooltip-1"
      >
        <Switch
          checked={row.status === 1 ? true : false}
          uncheckedIcon={false}
          onChange={() => refObj.chageStatus(row.admin_id, row.status)}
          height={20}
          width={45}
        />
      </LinkWithTooltip>
      <LinkWithTooltip
        tooltip="Click to Delete"
        href="#"
        clicked={(e) => refObj.confirmDelete(e, row.admin_id)}
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

const subAdminStatus = (refObj) => (cell) => {
  if (cell === 1) {
    return <p style={{ color: "green" }}>Active</p>;
  } else if (cell === 0) {
    return <p style={{ color: "red" }}> Inactive</p>;
  }
};

const setDate = (refOBj) => (cell) => {
  if (cell && cell !== "") {
    var mydate = new Date(cell);
    return dateFormat(mydate, "dd-mm-yyyy");
  } else {
    return "---";
  }
};

const initialValues = {
  email: "",
  phone: "",
  username: "",
  status: "",
  last_name: "",
  first_name: "",
  permissions: "",
  mng_users: false,
  mng_partners: false,
  mng_user_queries: false,
  mng_featured_list: false,
  mng_faqs: false,
  mng_user_review: false,
  mng_subs_price: false,
  mng_tc_pc: false,
};

class SubAdmins extends Component {
  constructor(props) {
    super(props);
    this.state = {
      SubAdmins: [],
      subAdminDetails: [],
      subAdmin_id: 0,
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
      search_text: "",
      status: "",
      startDate: "",
      endDate: "",
      view_admin: false,
    };
  }

  componentDidMount() {
    this.getSubAdminList();
    this.setState({
      todayDate: moment(new Date()).format("YYYY-MM-DD"),
    });
  }

  handlePageChange = (pageNumber) => {
    this.setState({ activePage: pageNumber });
    this.getSubAdminList(pageNumber > 0 ? pageNumber : 1);
  };

  getSubAdminList = (page = 1) => {
    let search_text = this.state.search_text;
    let status = this.state.status;
    let startDate = this.state.startDate;
    let endDate = this.state.endDate;

    API.get(
      `/api/adm/sub_admin?page=${page}&search_text=${encodeURIComponent(
        search_text
      )}&status=${encodeURIComponent(status)}&start_date=${encodeURIComponent(
        startDate
      )}&end_date=${encodeURIComponent(endDate)}`
    )
      .then((res) => {
        this.setState({
          subAdmins: res.data.data,
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

  subAdminSearch = (e) => {
    e.preventDefault();

    const search_text = document.getElementById("search_text").value;
    const status = document.getElementById("status").value;
    const startDate = document.getElementById("startDate").value;
    const endDate = document.getElementById("endDate").value;

    if (startDate !== "" && endDate !== "") {
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
      `/api/adm/sub_admin/?page=1&search_text=${encodeURIComponent(
        search_text
      )}&status=${encodeURIComponent(status)}&start_date=${encodeURIComponent(
        startDate
      )}&end_date=${encodeURIComponent(endDate)}`
    )
      .then((res) => {
        this.setState({
          subAdmins: res.data.data,
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
        endDate: "",
        remove_search: false,
      },
      () => {
        this.setState({ activePage: 1 });
        this.getSubAdminList();
      }
    );
  };

  modalCloseHandler = () => {
    this.setState({
      showModal: false,
      view_admin: false,
      subAdmin_id: 0,
      subAdminDetails: [],
    });
  };
  modalShowHandlerOnlyView = (event, id, row, view) => {
    if (id) {
      event.preventDefault();
      this.setState({
        showModal: true,
        subAdmin_id: id,
        subAdminDetails: row,
        view_admin: true,
      });
    } else {
      this.setState({
        showModal: true,
        subAdmin_id: 0,
        subAdminDetails: [],
      });
    }
  };

  modalShowHandler = (event, id, row) => {
    if (id) {
      event.preventDefault();
      this.setState({ showModal: true, subAdmin_id: id, subAdminDetails: row });
    } else {
      this.setState({
        showModal: true,
        subAdmin_id: 0,
        subAdminDetails: [],
      });
    }
  };

  handleSubmitEvent = (values, actions) => {
    if (
      values.mng_faqs == false &&
      values.mng_featured_list == false &&
      values.mng_partners == false &&
      values.mng_subs_price == false &&
      values.mng_tc_pc == false &&
      values.mng_user_queries == false &&
      values.mng_user_review == false &&
      values.mng_users == false
    ) {
      actions.setErrors({
        permissions: "Please select at least one permission",
      });
      actions.setSubmitting(false);
      return;
    }

    const post_data = {
      username: values.username,
      first_name: values.first_name,
      last_name: values.last_name,
      phone: values.phone,
      status: values.status,
      email: values.email,
      permissions: {
        mng_users: values.mng_users,
        mng_partners: values.mng_partners,
        mng_user_queries: values.mng_user_queries,
        mng_featured_list: values.mng_featured_list,
        mng_faqs: values.mng_faqs,
        mng_user_review: values.mng_user_review,
        mng_subs_price: values.mng_subs_price,
        mng_tc_pc: values.mng_tc_pc,
      },
    };

    let url = "";
    let method = "";

    if (this.state.subAdmin_id > 0) {
      url = `/api/adm/sub_admin/${this.state.subAdmin_id}`;
      method = "PUT";
    } else {
      url = `/api/adm/sub_admin/`;
      method = "POST";
    }

    API({
      url: url,
      method: method,
      data: post_data,
    })
      .then((res) => {
        this.setState({
          showModal: false,
        });
        swal({
          closeOnClickOutside: false,
          title: "Success",
          text:
            this.state.subAdmin_id > 0
              ? "Sub admin updated succesfully"
              : "Sub admin added succesfully",
          icon: "success",
        }).then(() => {
          this.setState({
            subAdmin_id: 0,
            subAdminDetails: [],
          });
          this.getSubAdminList();
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
        this.deleteSubAdmin(id);
      }
    });
  };

  chageStatus = (cell, status) => {
    API.put(`/api/adm/change_status_sub_admin/${cell}`, {
      status: status === 1 ? String(0) : String(1),
    })
      .then((res) => {
        swal({
          closeOnClickOutside: false,
          title: "Success",
          text: "Record updated successfully.",
          icon: "success",
        }).then(() => {
          this.getSubAdminList(this.state.activePage);
        });
      })
      .catch((err) => {
        if (err.data.status === 1) {
          this.setState({ closeModal: true });
          showErrorMessage(err, this.props);
        }
      });
  };

  deleteSubAdmin = (id) => {
    API.put(`/api/adm/delete_sub_admin/${id}`)
      .then((res) => {
        swal({
          closeOnClickOutside: false,
          title: "Success",
          text: "Record deleted successfully.",
          icon: "success",
        }).then(() => {
          this.getSubAdminList(this.state.activePage);
        });
      })
      .catch((err) => {
        if (err.data.status === 1) {
          this.setState({ closeModal: true });
          showErrorMessage(err, this.props);
        }
      });
  };

  render() {
    const { subAdminDetails, totalCount, subAdmin_id, view_admin } = this.state;
    const newInitialValues = Object.assign(initialValues, {
      username: subAdminDetails.username
        ? htmlDecode(subAdminDetails.username)
        : "",
      first_name: subAdminDetails.first_name
        ? htmlDecode(subAdminDetails.first_name)
        : "",
      last_name: subAdminDetails.last_name
        ? htmlDecode(subAdminDetails.last_name)
        : "",
      email: subAdminDetails.email ? htmlDecode(subAdminDetails.email) : "",
      phone: subAdminDetails.phone ? htmlDecode(subAdminDetails.phone) : "",
      status: subAdminDetails ? htmlDecode(String(subAdminDetails.status)) : "",

      mng_users: subAdminDetails.permissions
        ? subAdminDetails.permissions.mng_users
          ? subAdminDetails.permissions.mng_users
          : false
        : false,

      mng_partners: subAdminDetails.permissions
        ? subAdminDetails.permissions.mng_partners
          ? subAdminDetails.permissions.mng_partners
          : false
        : false,
      mng_user_queries: subAdminDetails.permissions
        ? subAdminDetails.permissions.mng_user_queries
          ? subAdminDetails.permissions.mng_user_queries
          : false
        : false,
      mng_featured_list: subAdminDetails.permissions
        ? subAdminDetails.permissions.mng_featured_list
          ? subAdminDetails.permissions.mng_featured_list
          : false
        : false,
      mng_faqs: subAdminDetails.permissions
        ? subAdminDetails.permissions.mng_faqs
          ? subAdminDetails.permissions.mng_faqs
          : false
        : false,
      mng_user_review: subAdminDetails.permissions
        ? subAdminDetails.permissions.mng_user_review
          ? subAdminDetails.permissions.mng_user_review
          : false
        : false,
      mng_subs_price: subAdminDetails.permissions
        ? subAdminDetails.permissions.mng_subs_price
          ? subAdminDetails.permissions.mng_subs_price
          : false
        : false,
      mng_tc_pc: subAdminDetails.permissions
        ? subAdminDetails.permissions.mng_tc_pc
          ? subAdminDetails.permissions.mng_tc_pc
          : false
        : false,
    });

    let validateStopFlag = Yup.object().shape({
      username: Yup.string().required("Please enter the user name"),
      first_name: Yup.string().required("Please enter the first name"),
      last_name: Yup.string().required("Please enter the last name"),
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
      permissions: Yup.string().optional(),
    });

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
                      Manage Sub-Admins (Total:{totalCount})
                      <small />
                    </h1>
                  </div>

                  <div className="col-lg-12 col-sm-12 col-xs-12  topSearchSection">
                    <div className="">
                      <button
                        type="button"
                        className="btn btn-info btn-sm"
                        onClick={(e) => this.modalShowHandler(e, "")}
                      >
                        <i className="fas fa-plus m-r-5" /> Add Sub-Admin
                      </button>
                    </div>
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
                          <option value="">Select Sub-Admin Status</option>
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
                          onClick={(e) => this.subAdminSearch(e)}
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
                    <BootstrapTable data={this.state.subAdmins}>
                      <TableHeaderColumn
                        isKey
                        dataField="username"
                        dataFormat={__htmlDecode(this)}
                      >
                        Username
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
                        dataField="created_date"
                        dataFormat={setDate(this)}
                      >
                        Created On
                      </TableHeaderColumn>

                      <TableHeaderColumn
                        dataField="status"
                        dataFormat={subAdminStatus(this)}
                      >
                        Status
                      </TableHeaderColumn>

                      <TableHeaderColumn
                        dataField="admin_id"
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

                    {/* ======= Add/Edit Sub-Admin Modal ======== */}
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
                                <Modal.Title>
                                  {/*  {view_admin &&
                                    subAdmin_id > 0 &&
                                    "View Sub-Admin"} */}
                                  {subAdmin_id > 0
                                    ? view_admin
                                      ? "View Sub-Admin"
                                      : "Edit Sub-Admin"
                                    : "Add Sub-Admin"}
                                </Modal.Title>
                              </Modal.Header>
                              <Modal.Body>
                                <div className="contBox">
                                  <Row>
                                    <Col xs={12} sm={12} md={12}>
                                      <div className="form-group">
                                        <label>
                                          Username
                                          <span className="impField">*</span>
                                        </label>
                                        <Field
                                          name="username"
                                          type="text"
                                          className={`form-control`}
                                          placeholder="Enter username"
                                          autoComplete="off"
                                          value={values.username}
                                          disabled={view_admin}
                                        />

                                        {errors.username && touched.username ? (
                                          <span className="errorMsg">
                                            {errors.username}
                                          </span>
                                        ) : null}
                                      </div>
                                    </Col>
                                  </Row>
                                  <Row>
                                    <Col xs={6} sm={6} md={6}>
                                      <div className="form-group">
                                        <label>
                                          First Name
                                          <span className="impField">*</span>
                                        </label>
                                        <Field
                                          name="first_name"
                                          type="text"
                                          className={`form-control`}
                                          placeholder="Enter first name"
                                          autoComplete="off"
                                          value={values.first_name}
                                          disabled={view_admin}
                                        />

                                        {errors.first_name &&
                                        touched.first_name ? (
                                          <span className="errorMsg">
                                            {errors.first_name}
                                          </span>
                                        ) : null}
                                      </div>
                                    </Col>
                                    {/* </Row>
                                  <Row> */}
                                    <Col xs={6} sm={6} md={6}>
                                      <div className="form-group">
                                        <label>
                                          Last Name
                                          <span className="impField">*</span>
                                        </label>

                                        <Field
                                          name="last_name"
                                          type="text"
                                          className={`form-control`}
                                          placeholder="Enter last name"
                                          autoComplete="off"
                                          value={values.last_name}
                                          disabled={view_admin}
                                        />

                                        {errors.last_name &&
                                        touched.last_name ? (
                                          <span className="errorMsg">
                                            {errors.last_name}
                                          </span>
                                        ) : null}
                                      </div>
                                    </Col>
                                  </Row>
                                  <Row>
                                    <Col xs={12} sm={12} md={12}>
                                      <div className="form-group">
                                        <label>
                                          Email
                                          <span className="impField">*</span>
                                        </label>
                                        <Field
                                          name="email"
                                          type="text"
                                          className={`form-control`}
                                          placeholder="Enter email"
                                          autoComplete="off"
                                          value={values.email}
                                          disabled={view_admin}
                                        />
                                        {errors.email && touched.email ? (
                                          <span className="errorMsg">
                                            {errors.email}
                                          </span>
                                        ) : null}
                                      </div>
                                    </Col>
                                  </Row>
                                  <Row>
                                    <Col xs={12} sm={12} md={12}>
                                      <div className="form-group">
                                        <label>
                                          Phone Number
                                          <span className="impField">*</span>
                                        </label>

                                        <Field
                                          name="phone"
                                          type="text"
                                          className={`form-control`}
                                          placeholder="Enter phone number"
                                          autoComplete="off"
                                          value={values.phone}
                                          disabled={view_admin}
                                        />
                                        {errors.phone && touched.phone ? (
                                          <span className="errorMsg">
                                            {errors.phone}
                                          </span>
                                        ) : null}
                                      </div>
                                    </Col>
                                  </Row>

                                  <Row>
                                    <Col xs={12} sm={12} md={12}>
                                      <div className="form-group">
                                        <label>
                                          Permissions
                                          <span className="impField">*</span>
                                        </label>
                                        <div
                                          className="row"
                                          role="group"
                                          aria-labelledby="checkbox-group"
                                        >
                                          <div className="col-md-4">
                                            <label>
                                              <Field
                                                name="mng_users"
                                                type="checkbox"
                                                checked={values.mng_users}
                                                value={values.mng_users}
                                                disabled={view_admin}
                                              />
                                              &nbsp;Users
                                            </label>
                                          </div>
                                          <div className="col-md-4">
                                            <label>
                                              <Field
                                                name="mng_partners"
                                                type="checkbox"
                                                checked={values.mng_partners}
                                                value={values.mng_partners}
                                                disabled={view_admin}
                                              />
                                              &nbsp; Partners
                                            </label>
                                          </div>

                                          <div className="col-md-4">
                                            <label>
                                              <Field
                                                name="mng_user_queries"
                                                type="checkbox"
                                                checked={
                                                  values.mng_user_queries
                                                }
                                                value={values.mng_user_queries}
                                                disabled={view_admin}
                                              />
                                              &nbsp; User Queries
                                            </label>
                                          </div>

                                          <div className="col-md-4">
                                            <label>
                                              <Field
                                                name="mng_featured_list"
                                                type="checkbox"
                                                checked={
                                                  values.mng_featured_list
                                                }
                                                value={values.mng_featured_list}
                                                disabled={view_admin}
                                              />
                                              &nbsp;Featured List
                                            </label>
                                          </div>

                                          <div className="col-md-4">
                                            <label>
                                              <Field
                                                name="mng_faqs"
                                                type="checkbox"
                                                checked={values.mng_faqs}
                                                value={values.mng_faqs}
                                                disabled={view_admin}
                                              />
                                              &nbsp; FAQs
                                            </label>
                                          </div>

                                          <div className="col-md-4">
                                            <label>
                                              <Field
                                                name="mng_user_review"
                                                type="checkbox"
                                                checked={values.mng_user_review}
                                                value={values.mng_user_review}
                                                disabled={view_admin}
                                              />
                                              &nbsp; User Review
                                            </label>
                                          </div>

                                          <div className="col-md-4">
                                            <label>
                                              <Field
                                                name="mng_subs_price"
                                                type="checkbox"
                                                checked={values.mng_subs_price}
                                                value={values.mng_subs_price}
                                                disabled={view_admin}
                                              />
                                              &nbsp; Subscription Price
                                            </label>
                                          </div>

                                          <div className="col-md-4">
                                            <label>
                                              <Field
                                                name="mng_tc_pc"
                                                type="checkbox"
                                                checked={values.mng_tc_pc}
                                                value={values.mng_tc_pc}
                                                disabled={view_admin}
                                              />
                                              &nbsp; Terms & Conditions
                                            </label>
                                          </div>
                                        </div>
                                        {errors.permissions ? (
                                          <span className="errorMsg">
                                            {errors.permissions}
                                          </span>
                                        ) : null}
                                      </div>
                                    </Col>
                                  </Row>

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
                                          disabled={view_admin}
                                        >
                                          <option key="-1" value="">
                                            Select
                                          </option>
                                          {this.state.selectStatus.map(
                                            (status, i) => (
                                              <option
                                                key={i}
                                                value={status.value}
                                              >
                                                {status.label}
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
                                {!view_admin && (
                                  <button
                                    className={`btn btn-success btn-sm ${
                                      isValid
                                        ? "btn-custom-green"
                                        : "btn-disable"
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
                                    {this.state.subAdmin_id > 0
                                      ? isSubmitting
                                        ? "Updating..."
                                        : "Update"
                                      : isSubmitting
                                      ? "Submitting..."
                                      : "Submit"}
                                  </button>
                                )}

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
export default SubAdmins;
