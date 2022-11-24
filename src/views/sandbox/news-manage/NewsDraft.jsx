import React, { useState, useEffect } from 'react'
import { Button, Table, Modal,notification } from 'antd'
import axios from 'axios'
import { DeleteOutlined, EditOutlined, ExclamationCircleOutlined, UploadOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'

const { confirm } = Modal

export default function NewsDraft(props) {

  const [dataSource, setdataSource] = useState([])

  const { username } = JSON.parse(localStorage.getItem('token'))  // 可以去本地存储里面看到token包裹的数据
  const navigate = useNavigate()

  useEffect(() => {
    axios.get(`/news?author=${username}&auditState=0&_expand=category`).then(res => {
      const list = res.data
      setdataSource(list)
    })
  }, [username])

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      // 通过 render 自定义一个样式,加粗 id
      render: (id) => {
        return <b>{id}</b>
      }
    },
    {
      title: '新闻标题',
      dataIndex: 'title',
      render: (title, item) => {
        return <a href={`#/news-manage/preview/${item.id}`}>{title}</a>
      }
    },
    {
      title: '作者',
      dataIndex: 'author',
    },
    {
      title: '分类信息',
      dataIndex: 'category',
      render: (category) => {
        return category.title
      }
    },

    {
      title: '操作',
      render: (item) => {//当标题为操作,这个对象里面没有设置 dataIndex 时,render 方法里面拿到的 item 就是 所在的一行的信息,否则,拿到的就是dataIndex的值
        return <div>

          {/* 删除 */}
          <Button danger shape="circle" icon={<DeleteOutlined />} onClick={() => confirmMethod(item)} />

          {/* 更新 */}
          <Button shape="circle" icon={<EditOutlined />} onClick={() => {
           navigate(`/news-manage/update/${item.id}`)
          }} />

          {/* 提交审核 */}
          <Button type="primary" shape="circle" icon={<UploadOutlined />} onClick={() => handleCheck(item.id)} />
        </div>
      }
    },
  ];

  const handleCheck = (id) => {
    // 发一个补丁请求，
    axios.patch(`/news/${id}`, {
      auditState: 1
    }).then(res => {
     navigate('/audit-manage/list')

      notification.info({
        message: '通知',
        description:
          `您可以到审核列表中查看您的新闻`,
        placement: 'bottomRight'
      })
    })
  }

  const confirmMethod = (item) => {
    confirm({
      title: '你确定要删除吗？',
      icon: <ExclamationCircleOutlined />,
      onOk() {
        deleteMethod(item)
      },
      onCancel() {
        
      },
    });
  }

  const deleteMethod = (item) => {
    // console.log(item);

    setdataSource(dataSource.filter(data => data.id !== item.id)) // react中不可以直接修改原状态，所以使用filter方法，会返回一个过滤后的新的数组，且不影响原来的数组
    // 后端同步 删除后端数据
    axios.delete(`/news/${item.id}`)
  }

  return (
    <div>
      {/* dataSource里面的数据是动态的从后端取回来的 */}
      <Table
        dataSource={dataSource}
        columns={columns}
        pagination={{
          pageSize: 5
        }}
        rowKey={item => item.id}
      />;
    </div>
  )
}