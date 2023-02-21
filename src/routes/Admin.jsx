import React, { Component } from "react";

import { Route, Switch, Redirect } from "react-router-dom";

import Login from "../components/admin/login/Login";
import AdminPageNotFound from "../components/404/AdminPageNotFound";

import Dashboard from "../components/admin/dashboard/Dashboard";

import UsersList from "../components/admin/users/Users";
import UsersQueries from "../components/admin/user_queries/user_queries";

/// MANAGE CMS
import FeaturedList from "../components/admin/manage_cms/featured_list/FeaturedList";
import FAQs from "../components/admin/manage_cms/manage_faq/Faqs";
import Price from "../components/admin/manage_cms/prices_list/Price";
import TcPc from "../components/admin/manage_cms/tcandpc/TcPc";
import editTcPC from "../components/admin/manage_cms/tcandpc/editContent";
import viewTcPC from "../components/admin/manage_cms/tcandpc/viewContent";

import UserReviews from "../components/admin/manage_cms/manage_reviews/UserReviews";
import PermissionsForm from "../components/admin/sub_admin_creation/sub_admin_creation";

import "../assets/css/all.css";
import "../assets/css/admin-style.css";
import "../assets/css/admin-skin-blue.css";
import "react-bootstrap-table/dist/react-bootstrap-table.min.css";

// Private Route for inner component
const PrivateRoute = ({ component: RefComponent, ...rest }) => (
  <Route
    {...rest}
    render={(props) =>
      localStorage.getItem("admin_token") ? (
        <RefComponent {...props} />
      ) : (
        <Redirect to="/" />
      )
    }
  />
);

class Admin extends Component {
  render() {
    return (
      <Switch>
        <Route exact path="/" component={Login} />
        <PrivateRoute
          path="/dashboard"
          component={Dashboard}
          handler="Dashboard"
        />
        <PrivateRoute path="/users_list" component={UsersList} />
        <PrivateRoute path="/queries_list" component={UsersQueries} />
        <PrivateRoute path="/featured_list" component={FeaturedList} />
        <PrivateRoute path="/faqs" component={FAQs} />
        <PrivateRoute path="/user_reviews" component={UserReviews} />
        <PrivateRoute path="/price" component={Price} />
        <PrivateRoute path="/tcpc" component={TcPc} />
        <PrivateRoute path="/edit_content/:id" component={editTcPC} />
        <PrivateRoute path="/view_content/:id" component={viewTcPC} />
        <PrivateRoute path="/sub_admin" component={PermissionsForm}/>

        <Route from="*" component={AdminPageNotFound} />
      </Switch>
    );
  }
}

export default Admin;
