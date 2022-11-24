import { useNavigate, useLocation } from "react-router";
import { Layout, Menu } from "antd";
import "./index.css";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { connect } from "react-redux";
const { Sider } = Layout;

function getItem(label, key, icon, children, type) {
  return {
    key,
    icon,
    children,
    label,
    type,
  };
}

function SideMenu(props) {
  const navigate = useNavigate();
  const location = useLocation()
  const {role:{rights}}=JSON.parse(localStorage.getItem('token'))
  const [meun, setmeun] = useState([])
  const openKeys = ["/" + location.pathname.split("/")[1]];
  const jumpPage=(e) => {
    navigate(e.key)
    
  }
  const checkPagePermission = (item) => {
    return item.pagepermisson && rights.includes(item.key)
  }
 const renderMenu=(menuList) => { 
  let items=[]
  let child=[]
 menuList.forEach((item) => {
if(checkPagePermission(item)){
  if(item.children?.length>0){
    item.children.forEach((itemChildren) => { 
      if (checkPagePermission(itemChildren)) {
        child.push(getItem(itemChildren.title,itemChildren.key,itemChildren.icon)) 
      }
     })
     items.push(getItem(item.title,item.key,item.icon,child))
     child=[] 
  } 
  else{
    items.push(getItem(item.title,item.key,item.icon))
  }
}
  })
  return items
 } 
useEffect(() => {
  axios.get('/rights?_embed=children').then((res) => {
    // console.log(res.data)
    setmeun(res.data)
  })
},[])
  return (
    <Sider trigger={null} collapsible collapsed={props.isCollapsed}>
      <div className="logo">新闻发布管理系统</div>
      <Menu
        theme="dark"
        mode="inline"
        defaultSelectedKeys={["1"]}
        defaultOpenKeys={openKeys}
        selectedKeys={[location.pathname]}
        items={renderMenu(meun)}
        onClick={jumpPage}
      />
    </Sider>
  );
}
const mapStateToProps = ({ CollapsedReducer: { isCollapsed } }) => {
  return {
    isCollapsed
  }
}
export default connect(mapStateToProps)(SideMenu)