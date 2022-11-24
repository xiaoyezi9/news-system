// @ts-nocheck
import React, { useContext, useEffect, useRef, useState } from 'react'
import { Button, Table, Modal, Form, Input } from 'antd'
import { DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import axios from 'axios'
const { confirm } = Modal;
const EditableContext = React.createContext(null);

export default function NewsCategory() {

  const [dataSource, setdataSource] = useState([])

  useEffect(() => {
    axios.get('/categories').then(res => {
      setdataSource(res.data)
    })
  }, [])

  const EditableRow = ({ index, ...props }) => {
    const [form] = Form.useForm();
    return (
      <Form form={form} component={false}>
        <EditableContext.Provider value={form}>
          <tr {...props} />
        </EditableContext.Provider>
      </Form>
    );
  };

  const EditableCell = ({
    title,
    editable,
    children,
    dataIndex,
    record,
    handleSave,
    ...restProps
  }) => {
    const [editing, setEditing] = useState(false);
    const inputRef = useRef(null);
    const form = useContext(EditableContext);
    useEffect(() => {
      if (editing) {
        inputRef.current.focus();
      }
    }, [editing]);

    const toggleEdit = () => {
      setEditing(!editing);
      form.setFieldsValue({
        [dataIndex]: record[dataIndex],
      });
    };

    const save = async () => {
      try {
        const values = await form.validateFields();
        toggleEdit();
        handleSave({ ...record, ...values });
      } catch (errInfo) {
        console.log('Save failed:', errInfo);
      }
    };

    let childNode = children;

    if (editable) {
      childNode = editing ? (
        <Form.Item
          style={{
            margin: 0,
          }}
          name={dataIndex}
          rules={[
            {
              required: true,
              message: `${title} is required.`,
            },
          ]}
        >
          <Input ref={inputRef} onPressEnter={save} onBlur={save} />
        </Form.Item>
      ) : (
        <div
          className="editable-cell-value-wrap"
          style={{
            paddingRight: 24,
          }}
          onClick={toggleEdit}
        >
          {children}
        </div>
      );
    }

    return <td {...restProps}>{childNode}</td>;
  };

  const components = {
    body: {
      row: EditableRow,
      cell: EditableCell,
    },
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      render: (id) => {
        return <b>{id}</b>
      }
    },
    {
      title: '栏目名称',
      dataIndex: 'title',
      onCell: (record) => (
        {
          record,
          editable: true,
          dataIndex: 'title',
          title: '栏目名称',
          handleSave,
        }),
    },
    {
      title: '操作',
      render: (item) => {
        return <div>
          <Button danger shape="circle" icon={<DeleteOutlined />} onClick={() => confirmMethod(item)} />
        </div>
      }
    },
  ]

  const handleSave = (row) => {
    setdataSource(dataSource.map(item=>{
      if(item.id === row.id) {
        return {
          id: item.id,
          title: row.title,
          value: row.title,
        }
      }
      return item
    }))
    axios.patch(`/categories/${row.id}`,{
      title: row.title,
      value: row.title,
    })
  };


  const confirmMethod = (item) => {
    confirm({
      title: '你确定要删除？',
      icon: <ExclamationCircleOutlined />,
      onOk() {
        deleteMethod(item);
      },
      onCancel() {
      },
    });
  }

  const deleteMethod = (item) => {
    setdataSource(dataSource.filter(data => data.id !== item.id))
    axios.delete(`/categories/${item.id}`)
  }

  return (
    <div>
      <Table dataSource={dataSource} columns={columns} rowKey={(item) => item.id}
        pagination={{
          pageSize: 5,
        }}
        components={components}
      />;
    </div>
  )
}