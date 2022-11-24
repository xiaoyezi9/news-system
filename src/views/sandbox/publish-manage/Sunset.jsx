import { Button } from 'antd'
import React from 'react'
import NewsPublish from '../../../components/publish-manage/NewsPublish'
import usePublish from '../../../components/publish-manage/usePublish'

export default function Sunset() {
  //3代表已经下线的
  const {dataSource,handleDelete}=usePublish(3)
  return (
    <div>
    <NewsPublish dataSource={dataSource}
      button={
        (id) => <Button
          danger
          onClick={() => handleDelete(id)}>
          删除
        </Button>}>
    </NewsPublish>
  </div>
  )
}
