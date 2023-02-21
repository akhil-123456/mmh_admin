import React, { Component } from "react";
import { BootstrapTable, TableHeaderColumn } from "react-bootstrap-table";
import { Link } from "react-router-dom";
import { Modal, Tooltip, OverlayTrigger } from "react-bootstrap";
import API from "../../../../shared/admin-axios";
import { showErrorMessage } from "../../../../shared/handle_error";
import Layout from "../../layout/Layout";
import ReactHtmlParser from "react-html-parser";
import dateFormat from "dateformat";
import LoaderSpinner from "../../Loader/loader";
import { htmlDecode } from "../../../../shared/helper";

const __htmlDecode = (refObj) => (cell) => {
  return ReactHtmlParser(htmlDecode(cell));
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

class TcPc extends Component {
  constructor(props) {
    super(props);

    this.state = {
      TcPcList: [],
      isLoading: true,
      showModal: false,
      thumbNailModal: false,
    };
  }

  actionFormatter = (refObj) => (cell, row) => {
    return (
      <div className="actionStyle">
        <LinkWithTooltip
          tooltip="Click to view"
          href="#"
          clicked={(e) =>
            this.props.history.push({
              pathname: "/view_content/" + cell,
              state: { content: row },
            })
          }
          id="tooltip-1"
        >
          <i className="far fa-eye" />
        </LinkWithTooltip>
        <LinkWithTooltip
          tooltip={"Click to Edit"}
          clicked={(e) =>
            this.props.history.push({
              pathname: "/edit_content/" + cell,
              state: { content: row },
            })
          }
          href="#"
          id="tooltip-1"
        >
          <i className="far fa-edit" />
        </LinkWithTooltip>
      </div>
    );
  };

  getTcPcList = () => {
    API.get(`/api/adm/tc_pc_list`)
      .then((res) => {
        this.setState({
          TcPcList: res.data.data,
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

  componentDidMount() {
    this.getTcPcList();
  }

  modalCloseHandler = () => {
    this.setState({ showModal: false });
  };

  imageModalShowHandler = (url) => {
    console.log(url);
    this.setState({ thumbNailModal: true, image_url: url });
  };
  imageModalCloseHandler = () => {
    this.setState({ thumbNailModal: false, image_url: "" });
  };

  setBannerImage = (refObj) => (cell, row) => {
    if (row.image_url !== null) {
      return (
        <img
          src={cell}
          alt="Banner Image"
          width="100"
          height="80"
          onClick={(e) => refObj.imageModalShowHandler(row.image_url)}
        ></img>
      );
    } else {
      return null;
    }
  };

  render() {
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
                      Manage Content
                      <small />
                    </h1>
                  </div>
                </div>
              </section>
              <section className="content">
                <div className="box">
                  <div className="box-body">
                    <BootstrapTable data={this.state.TcPcList}>
                      <TableHeaderColumn
                        isKey
                        dataField="title"
                        dataFormat={__htmlDecode(this)}
                      >
                        Title
                      </TableHeaderColumn>
                      <TableHeaderColumn
                        dataField="description"
                        dataFormat={__htmlDecodeDescription(this)}
                        //tdStyle={{ wordBreak: "break-word" }}
                      >
                        Description
                      </TableHeaderColumn>

                      {/* <TableHeaderColumn
                        dataField="image_url"
                        dataFormat={this.setBannerImage(this)}
                      >
                        Image
                      </TableHeaderColumn> */}
                      <TableHeaderColumn
                        dataField="created_at"
                        dataFormat={setDate(this)}
                      >
                        Post Date
                      </TableHeaderColumn>
                      <TableHeaderColumn
                        dataField="updated_at"
                        dataFormat={setDate(this)}
                      >
                        Updated at
                      </TableHeaderColumn>
                      <TableHeaderColumn
                        dataField="id"
                        dataFormat={this.actionFormatter(this)}
                        dataAlign=""
                      >
                        Action
                      </TableHeaderColumn>
                    </BootstrapTable>

                    <Modal
                      show={this.state.thumbNailModal}
                      onHide={() => this.imageModalCloseHandler()}
                      backdrop="static"
                    >
                      <Modal.Header closeButton>Banner Image</Modal.Header>
                      <Modal.Body>
                        <center>
                          <div className="imgUi">
                            <img
                              src={this.state.user_url}
                              alt="Banner Image"
                            ></img>
                          </div>
                        </center>
                      </Modal.Body>
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
export default TcPc;
