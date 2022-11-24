// @ts-nocheck

import { Button, Modal, Popover, Switch, Table, Tag } from 'antd';
import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { DeleteOutlined,EditOutlined,ExclamationCircleOutlined   } from '@ant-design/icons';
const { confirm } = Modal;
export default function RightList() {
   const [dataSource, setdataSource] = useState([])
  useEffect(() => {
    axios.get('/rights?_embed=children').then((res) => {
      const list =res.data
      //控制没有Children数据的选项出现展开图标，却没有数据可以展示
      //当children为[]，也会出现展开图标，所以将他变成‘’
      list.forEach((item) => { 
        if(item.children.length===0) {
          item.children=''
       }
      })
       setdataSource(list)
    })
  },[])

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
     render:(id) => { 
      return <b>{id}</b>
      }
    },
    {
      title: '权限名称',
      dataIndex: 'title',
    
    },
    {
      title: '权限路径',
      dataIndex: 'key',
      render:(key) => {
        return <Tag color='orange'>{key}</Tag>
      }
     
    },
    {
      title: '操作',
      render:(item) => {
        return <div> 
           <Button  danger shape="circle" icon={<DeleteOutlined />} onClick={() => {  confirmDelete(item) }}/>

           <Popover content={
           <div style={{ textAlign: 'center' }}>
            <Switch checked={item.pagepermisson} onChange={() => switchMethod(item)}></Switch>
                  </div>} title="页面配置项" trigger={item.pagepermisson === undefined ? '' : 'click'}>
            <Button type="primary" shape="circle" icon={<EditOutlined />}
              disabled={item.pagepermisson === undefined} />
          </Popover>
        </div>
      }
    
    },
  ];
  // 删除对话框
  const confirmDelete= (item) => {
    confirm({
      title: '确认是否删除',
      icon: <ExclamationCircleOutlined />,
      onOk() {
        deleteMethod(item)
      },
  
      onCancel() {
      },
    });
  }
// 删除方法
const  deleteMethod=(item) => { 
// console.log(item);
if(item.grade===1){
  setdataSource(dataSource.filter(data => data.id!==item.id  )) //filter不影响原数组的数据
axios.delete('/rights/${item.id}')
}else{
  let list=dataSource.filter(data=>data.id===item.rightId) //查找上一级ID
   list[0].children=list[0].children.filter(data=>data.id!==item.id)
   setdataSource([...dataSource])  //filter只能保证一层不影响数据
axios.delete('/children/${item.id}')

}
 }
 
 const switchMethod = (item) => {
  item.pagepermisson = item.pagepermisson === 1 ? 0 : 1
  setdataSource([...dataSource])
  if(item.grade===1) {
    axios.patch(`/rights/${item.id}`,{
      pagepermisson: item.pagepermisson
    })
  } else {
    axios.patch(`/children/${item.id}`,{
      pagepermisson: item.pagepermisson
    })
  }
}
  return (
   <Table dataSource={dataSource} columns={columns} pagination={{pageSize:5}} /> )
}
