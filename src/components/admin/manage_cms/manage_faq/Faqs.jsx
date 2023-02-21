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
import Switch from "react-switch";
import { showErrorMessage } from "../../../../shared/handle_error";
import dateFormat from "dateformat";
import { Editor } from "@tinymce/tinymce-react";

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
      <LinkWithTooltip
        tooltip={"Click to change status"}
        // clicked={(e) => refObj.chageStatus(e, cell, row.status)}
        href="#"
        id="tooltip-1"
      >
        <Switch
          checked={row.status == 1 ? true : false}
          uncheckedIcon={false}
          onChange={() => refObj.chageStatus(row.id, row.status)}
          height={20}
          width={45}
        />
      </LinkWithTooltip>
      <LinkWithTooltip
        tooltip="Click to Delete"
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
const __htmlDecodeDescription = (refObj) => (cell) => {
  if (cell.length > 100) {
    return htmlDecode(cell.substring(0, 100).concat("...."));
  } else {
    return htmlDecode(cell);
  }
};

const faqStatus = (refObj) => (cell) => {
  if (cell === 1) {
    return <p style={{ color: "green" }}>Active</p>;
  } else if (cell === 0) {
    return <p style={{ color: "red" }}> Inactive</p>;
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
  description: "",
  status: "",
};

class Faqs extends Component {
  constructor(props) {
    super(props);
    this.state = {
      faq: [],
      faqDetails: {},
      isLoading: true,
      showModal: false,

      thumbNailModal: false,
      selectStatus: [
        { value: "0", label: "Inactive" },
        { value: "1", label: "Active" },
      ],
      thumbNailModal: false,
      search_text: "",
      status: "",
    };
  }

  componentDidMount() {
    this.getFaqlist();
  }

  getFaqlist = () => {
    let search_text = this.state.search_text;
    let status = this.state.status;

    API.get(
      `/api/adm/faq?search_text=${encodeURIComponent(
        search_text
      )}&status=${encodeURIComponent(status)}`
    )
      .then((res) => {
        this.setState({
          faq: res.data.data,
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

  faqSearch = (e) => {
    e.preventDefault();

    const search_text = document.getElementById("search_text").value;
    const status = document.getElementById("status").value;

    if (search_text === "" && status === "") {
      return false;
    }

    API.get(
      `/api/adm/faq?search_text=${encodeURIComponent(
        search_text
      )}&status=${encodeURIComponent(status)}`
    )
      .then((res) => {
        this.setState({
          faq: res.data.data,
          isLoading: false,
          search_text: search_text,
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

    this.setState(
      {
        search_text: "",
        status: "",
        remove_search: true,
      },
      () => {
        this.getFaqlist();
      }
    );
  };

  modalCloseHandler = () => {
    this.setState({ banner_id: 0 });
    this.setState({ showModal: false });
    this.setState({
      faq_id: 0,
      faqDetails: {},
      validationMessage: "",
    });
  };

  modalShowHandler = (event, id, row) => {
    if (id) {
      event.preventDefault();
      this.setState({
        showModal: true,
        faq_id: id,
        faqDetails: row,
      });
    } else {
      this.setState({
        showModal: true,
        faq_id: 0,
        faqDetails: {},
      });
    }
  };

  handleSubmitEvent = (values, actions) => {
    let url = "";
    let method = "";
    const post_data = {
      title: values.title,
      description: values.description,
      status: values.status,
    };
    if (this.state.faq_id > 0) {
      url = `/api/adm/update_faq/${this.state.faq_id}`;
      method = "PUT";
    } else {
      url = `/api/adm/faq`;
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
          this.getFaqlist();
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
        this.deleteFaq(id);
      }
    });
  };

  chageStatus = (cell, status) => {
    API.put(`/api/adm/change_status_faq/${cell}`, {
      status: status == 1 ? String(0) : String(1),
    })
      .then((res) => {
        swal({
          closeOnClickOutside: false,
          title: "Success",
          text: "Record updated successfully.",
          icon: "success",
        }).then(() => {
          this.getFaqlist();
        });
      })
      .catch((err) => {
        if (err.data.status === 3) {
          this.setState({ closeModal: true });
          showErrorMessage(err, this.props);
        }
      });
  };

  deleteFaq = (id) => {
    API.put(`/api/adm/faq/${id}`)
      .then((res) => {
        swal({
          closeOnClickOutside: false,
          title: "Success",
          text: "Record deleted successfully.",
          icon: "success",
        }).then(() => {
          this.getFaqlist();
        });
      })
      .catch((err) => {
        if (err.data.status === 3) {
          this.setState({ closeModal: true });
          showErrorMessage(err, this.props);
        }
      });
  };

  render() {
    const { faqDetails } = this.state;

    const newInitialValues = Object.assign(initialValues, {
      title: faqDetails.title ? htmlDecode(faqDetails.title) : "",
      description: faqDetails.description
        ? htmlDecode(faqDetails.description)
        : "",
      status:
        faqDetails.status || +faqDetails.status === 0
          ? faqDetails.status.toString()
          : "",
    });

    let validateStopFlag = Yup.object().shape({
      title: Yup.string().required("Please enter the question"),
      description: Yup.string().required("Please enter the answer"),
      status: Yup.string()
        .trim()
        .required("Please select status")
        .matches(/^[0|1]$/, "Invalid status selected"),
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
                      Manage FAQs (Total:{this.state.faq.length})
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
                        <i className="fas fa-plus m-r-5" /> Add FAQ
                      </button>
                    </div>
                    <form className="form">
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
                          <option value="">Select FAQ Status</option>
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
                          onClick={(e) => this.faqSearch(e)}
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
                    <BootstrapTable data={this.state.faq}>
                      <TableHeaderColumn
                        isKey
                        dataField="title"
                        dataFormat={__htmlDecode(this)}
                      >
                        Question
                      </TableHeaderColumn>
                      <TableHeaderColumn
                        dataField="description"
                        dataFormat={__htmlDecodeDescription(this)}
                      >
                        Answer
                      </TableHeaderColumn>

                      <TableHeaderColumn
                        dataField="created_at"
                        dataFormat={setDate(this)}
                      >
                        Post Date
                      </TableHeaderColumn>

                      <TableHeaderColumn
                        dataField="status"
                        dataFormat={faqStatus(this)}
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
                                <Modal.Title>
                                  {this.state.faq_id > 0
                                    ? "Edit FAQ"
                                    : "Add FAQ"}
                                </Modal.Title>
                              </Modal.Header>
                              <Modal.Body>
                                <div className="contBox">
                                  <Row>
                                    <Col xs={12} sm={12} md={12}>
                                      <div className="form-group">
                                        <label>
                                          Question
                                          <span className="impField">*</span>
                                        </label>
                                        <Field
                                          name="title"
                                          type="text"
                                          className={`form-control`}
                                          placeholder="Enter question"
                                          autoComplete="off"
                                          value={values.title}
                                        />
                                        {errors.title && touched.title ? (
                                          <span className="errorMsg">
                                            {errors.title}
                                          </span>
                                        ) : null}
                                      </div>
                                    </Col>
                                  </Row>
                                  <Row>
                                    <Col xs={12} sm={12} md={12}>
                                      <div className="form-group">
                                        <label>
                                          Answer
                                          <span className="impField">*</span>
                                        </label>
                                        <Editor
                                          value={values.description}
                                          init={{
                                            height: 200,
                                            menubar: false,
                                            plugins: [
                                              "advlist autolink lists link charmap print preview anchor",
                                              "searchreplace visualblocks code fullscreen",
                                              "insertdatetime = table paste code help wordcount",
                                            ],
                                            toolbar:
                                              "insertfile undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | visualblocks code ",
                                            content_style:
                                              "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",

                                            paste_data_images: false,
                                          }}
                                          onEditorChange={(value) =>
                                            setFieldValue("description", value)
                                          }
                                        />
                                        {errors.description &&
                                        touched.description ? (
                                          <span className="errorMsg">
                                            {errors.description}
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
                                          value={values.status}
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
                                  {this.state.faq_id > 0
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
export default Faqs;
