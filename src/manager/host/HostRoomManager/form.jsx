// RoomFormPage.jsx
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import apiList from '@/api'
const MAX_IMAGES = 15
const MIN_IMAGES = 3

export default function HostRoomFormPage({ mode = 'create' }) {
  const nav = useNavigate()
  const { id } = useParams()
  const isEdit = mode === 'edit'
  const isView = mode === 'detail'

  // options
  const [roomTypes, setRoomTypes] = useState([])
  const [amenities, setAmenities] = useState([])
  const [provinces, setProvinces] = useState([])
  const [districts, setDistricts] = useState([])
  const [wards, setWards] = useState([])

  // loading flags
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [loadingProv, setLoadingProv] = useState(false)
  const [loadingDist, setLoadingDist] = useState(false)
  const [loadingWard, setLoadingWard] = useState(false)

  // ảnh (lazy upload)
  const [uploading, setUploading] = useState(false)
  const [blobFiles, setBlobFiles] = useState({})
  const removedServerUrlsRef = useRef(new Set())
  const initialServerUrlsRef = useRef(new Set())

  // form state
  const [values, setValues] = useState({
    roomTypeId: '',
    provinceName: '',
    provinceId: '',
    districtId: '',
    wardId: '',
    addressLine: '',
    title: '',
    description: '',
    priceMonth: '',
    deposit: '',
    electricityPrice: '',
    waterPrice: '',
    areaSqm: '',
    maxOccupancy: '',
    amenityIds: [],
    imageUrls: [],
  })
  const [addressEdited, setAddressEdited] = useState(false)

  const setValue = (name) => (eOrVal) => {
    const v = eOrVal?.target ? eOrVal.target.value : eOrVal
    setValues((s) => ({ ...s, [name]: v }))
  }

  useEffect(() => {
    ;(async () => {
      try {
        setLoadingProv(true)
        const [rt, am, pv] = await Promise.all([
          apiList.getRoomType(),
          apiList.getAmenity?.(),
          apiList.getProvinces(),
        ])
        if (rt?.status === 200 && Array.isArray(rt.data)) setRoomTypes(rt.data)
        const amenData = am?.data || am
        if (am && Array.isArray(amenData)) setAmenities(amenData)
        if (pv?.status === 200 && Array.isArray(pv.data)) setProvinces(pv.data)
      } finally {
        setLoadingProv(false)
      }
    })()
  }, [])

  const loadDistricts = async (id) => {
    if (!id) {
      setDistricts([])
      return
    }
    setLoadingDist(true)
    try {
      const { status, data } = await apiList.getDistricts(id)
      if (status === 200 && Array.isArray(data)) setDistricts(data)
    } finally {
      setLoadingDist(false)
    }
  }
  const loadWards = async (id) => {
    if (!id) {
      setWards([])
      return
    }
    setLoadingWard(true)
    try {
      const { status, data } = await apiList.getWards(id)
      if (status === 200 && Array.isArray(data)) setWards(data)
    } finally {
      setLoadingWard(false)
    }
  }

  useEffect(() => {
    if (!values.provinceId) {
      setDistricts([])
      setWards([])
      setValues((s) => ({ ...s, districtId: '', wardId: '' }))
      return
    }
    loadDistricts(Number(values.provinceId))
    setValues((s) => ({ ...s, districtId: '', wardId: '' }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values.provinceId])

  useEffect(() => {
    if (!values.districtId) {
      setWards([])
      setValues((s) => ({ ...s, wardId: '' }))
      return
    }
    loadWards(Number(values.districtId))
    setValues((s) => ({ ...s, wardId: '' }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values.districtId])

  // ------------ fetch detail (edit/detail) ------------
  useEffect(() => {
    if (!isEdit && !isView) return
    if (!id) return
    ;(async () => {
      setLoading(true)
      try {
        const { status, data } = await apiList.getRoomId(id)
        if (status === 200 && data) {
          const imgs = Array.isArray(data.imageUrls) ? data.imageUrls : []
          initialServerUrlsRef.current = new Set(imgs)
          removedServerUrlsRef.current = new Set()

          setValues((s) => ({
            ...s,
            roomTypeId: data.roomTypeId ? String(data.roomTypeId) : '',
            provinceId: data.provinceId ? String(data.provinceId) : '',
            districtId: data.districtId ? String(data.districtId) : '',
            wardId: data.wardId ? String(data.wardId) : '',
            addressLine: data.addressLine || '',
            title: data.title || '',
            description: data.description || '',
            priceMonth: data.priceMonth ?? '',
            deposit: data.deposit ?? '',
            electricityPrice: data.electricityPrice ?? '',
            waterPrice: data.waterPrice ?? '',
            areaSqm: data.areaSqm ?? '',
            maxOccupancy: data.maxOccupancy ?? '',
            amenityIds: Array.isArray(data.amenityIds) ? data.amenityIds : [],
            imageUrls: imgs,
          }))

          if (data.provinceId) await loadDistricts(Number(data.provinceId))
          if (data.districtId) await loadWards(Number(data.districtId))
        } else {
          toast.error('Không tìm thấy phòng')
        }
      } catch (e) {
        console.error(e)
        toast.error('Tải chi tiết thất bại')
      } finally {
        setLoading(false)
      }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, mode])

  // ------------ ghép địa chỉ ------------
  const findNameById = (list, id) =>
    list.find((x) => String(x.id) === String(id))?.name || ''

  const provinceName = useMemo(
    () => findNameById(provinces, values.provinceId),
    [provinces, values.provinceId]
  )
  const districtName = useMemo(
    () => findNameById(districts, values.districtId),
    [districts, values.districtId]
  )
  const wardName = useMemo(
    () => findNameById(wards, values.wardId),
    [wards, values.wardId]
  )

  useEffect(() => {
    if (addressEdited) return
    const composed = [wardName, districtName, provinceName]
      .filter(Boolean)
      .join(', ')
    if (!composed) return
    setValues((s) => (!s.addressLine ? { ...s, addressLine: composed } : s))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provinceName, districtName, wardName])

  // ------------ chọn ảnh (preview bằng blob, KHÔNG upload) ------------
  const onPickFiles = async (e) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    e.target.value = ''

    const remaining = MAX_IMAGES - (values.imageUrls?.length || 0)
    if (remaining <= 0) {
      toast.info(`Đã đạt tối đa ${MAX_IMAGES} ảnh`)
      return
    }
    const toAdd = files.slice(0, remaining)
    if (files.length > remaining) {
      toast.info(`Chỉ thêm tối đa ${remaining} ảnh (tối đa ${MAX_IMAGES})`)
    }

    setUploading(true)
    try {
      const blobs = toAdd.map((f) => {
        const url = URL.createObjectURL(f)
        return { url, file: f }
      })
      setValues((s) => ({
        ...s,
        imageUrls: (s.imageUrls || []).concat(blobs.map((b) => b.url)),
      }))
      setBlobFiles((m) => {
        const copy = { ...m }
        blobs.forEach(({ url, file }) => {
          copy[url] = file
        })
        return copy
      })
    } finally {
      setUploading(false)
    }
  }

  const isBlob = (u) => typeof u === 'string' && u.startsWith('blob:')
  const revokeIfBlob = (u) => {
    if (isBlob(u))
      try {
        URL.revokeObjectURL(u)
        // eslint-disable-next-line no-empty
      } catch {}
  }

  const makeCover = (idx) => {
    setValues((s) => {
      const arr = (s.imageUrls || []).slice()
      const [x] = arr.splice(idx, 1)
      arr.unshift(x)
      return { ...s, imageUrls: arr }
    })
  }

  const removeImage = (idx) => {
    setValues((s) => {
      const arr = (s.imageUrls || []).slice()
      const u = arr[idx]
      arr.splice(idx, 1)

      // Nếu là blob: chỉ revoke và xoá khỏi map
      if (isBlob(u)) {
        revokeIfBlob(u)
        setBlobFiles((m) => {
          const copy = { ...m }
          delete copy[u]
          return copy
        })
      } else {
        // URL server: đánh dấu để xoá sau khi Lưu (chỉ áp dụng khi edit)
        removedServerUrlsRef.current.add(u)
      }

      return { ...s, imageUrls: arr }
    })
  }

  // dọn blob khi unmount
  useEffect(() => {
    return () => {
      values.imageUrls?.forEach(revokeIfBlob)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ------------ submit ------------
  const toNum = (x) =>
    x === '' || x === null || x === undefined ? null : Number(x)

  const buildPayload = (finalUrls) => ({
    roomTypeId: values.roomTypeId ? Number(values.roomTypeId) : null,
    wardId: values.wardId ? Number(values.wardId) : null,
    title: (values.title || '').trim(),
    description: (values.description || '').trim(),
    addressLine: (values.addressLine || '').trim(),
    priceMonth: toNum(values.priceMonth),
    deposit: toNum(values.deposit),
    electricityPrice: toNum(values.electricityPrice),
    waterPrice: toNum(values.waterPrice),
    areaSqm: toNum(values.areaSqm),
    maxOccupancy: toNum(values.maxOccupancy),
    amenityIds:
      Array.isArray(values.amenityIds) && values.amenityIds.length
        ? values.amenityIds.map(Number)
        : null,
    imageUrls: Array.isArray(finalUrls) ? finalUrls : [],
  })

  const uploadBlobIfNeeded = async (u, idx) => {
    if (!isBlob(u)) return u
    const file = blobFiles[u]
    if (!file) throw new Error(`Không tìm thấy file cho ảnh tạm #${idx + 1}`)
    const res = await apiList.uploadImage(file, file.name)
    const url = res?.data?.url || res?.url
    if (!url) throw new Error('Upload ảnh thất bại')
    // dọn blob
    revokeIfBlob(u)
    setBlobFiles((m) => {
      const c = { ...m }
      delete c[u]
      return c
    })
    return url
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    if (isView) return
    if (!values.wardId) {
      toast.error('Vui lòng chọn Phường/Xã')
      return
    }
    if ((values.imageUrls?.length || 0) < MIN_IMAGES) {
      toast.error(`Vui lòng chọn tối thiểu ${MIN_IMAGES} ảnh`)
      return
    }

    setSaving(true)
    try {
      // 1) Upload toàn bộ blob theo thứ tự hiện tại
      const uploaded = await Promise.all(
        values.imageUrls.map((u, idx) => uploadBlobIfNeeded(u, idx))
      )
      // 2) Gửi payload
      const payload = buildPayload(uploaded)

      if (isEdit) {
        await toast.promise(apiList.updateRoom(id, payload), {
          pending: 'Đang cập nhật...',
          success: 'Đã cập nhật',
          error: 'Cập nhật thất bại',
        })
      } else {
        const res = await toast.promise(apiList.createRoom(payload), {
          pending: 'Đang tạo phòng...',
          success: 'Đã tạo phòng',
          error: 'Tạo phòng thất bại',
        })
        const newId = res?.data?.id || res?.id
        // reset removed list vì tạo mới không có xóa server
        removedServerUrlsRef.current = new Set()
        nav(`/host/danh-sach-phong-tro/${newId || ''}`)
        return
      }

      // 3) (chỉ khi edit) Xoá các ảnh server đã xoá khỏi danh sách
      if (isEdit && removedServerUrlsRef.current.size) {
        const finalSet = new Set(uploaded.filter((u) => !isBlob(u)))
        const toDelete = Array.from(removedServerUrlsRef.current).filter(
          (u) => !finalSet.has(u)
        )
        if (toDelete.length) {
          await Promise.allSettled(toDelete.map((u) => apiList.deleteImage(u)))
        }
        removedServerUrlsRef.current = new Set()
      }

      nav(-1)
    } catch (err) {
      console.error(err)
      toast.error(err?.message || 'Lưu thất bại')
    } finally {
      setSaving(false)
    }
  }

  // ------------ render ------------
  return (
    <div className="container py-4">
      <form id="roomForm" onSubmit={onSubmit} className="vstack gap-4">
        {/* Thông tin trọ */}
        <section className="p-4 border rounded-3 bg-white">
          <div className="fs-5 fw-semibold mb-3">Thông tin trọ</div>
          {loading ? (
            <div className="text-muted">Đang tải dữ liệu...</div>
          ) : (
            <div className="row gy-3">
              <div className="col-md-8">
                <label className="form-label">Tên trọ</label>
                <input
                  className="form-control"
                  value={values.title}
                  onChange={setValue('title')}
                  disabled={isView || saving}
                  placeholder="Tên trọ"
                  required
                />
              </div>
              <div className="col-md-4">
                <label className="form-label">Loại phòng</label>
                <select
                  className="form-select"
                  value={values.roomTypeId}
                  onChange={setValue('roomTypeId')}
                  disabled={isView || saving}
                >
                  <option value="">— Chọn loại phòng —</option>
                  {roomTypes.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tỉnh / Quận / Phường */}
              <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-3 m-0">
                <div className="col p-0">
                  <label className="form-label">Tỉnh/Thành phố</label>
                  <select
                    className="form-select"
                    value={values.provinceName}
                    onChange={setValue('provinceId')}
                    disabled={isView || saving || loadingProv}
                  >
                    <option value="">Chọn tỉnh/thành phố</option>
                    {provinces.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col p-0">
                  <label className="form-label">Quận/Huyện</label>
                  <select
                    className="form-select"
                    value={values.districtId}
                    onChange={setValue('districtId')}
                    disabled={
                      isView || saving || !values.provinceId || loadingDist
                    }
                  >
                    <option value="">Chọn quận/huyện</option>
                    {districts.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col p-0">
                  <label className="form-label">Phường/Xã</label>
                  <select
                    className="form-select"
                    value={values.wardId}
                    onChange={setValue('wardId')}
                    disabled={
                      isView || saving || !values.districtId || loadingWard
                    }
                    required
                  >
                    <option value="">Chọn phường/xã</option>
                    {wards.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="col-12">
                <label className="form-label">Địa chỉ đầy đủ</label>
                <input
                  className="form-control"
                  value={values.addressLine}
                  onChange={(e) => {
                    setAddressEdited(true)
                    setValue('addressLine')(e)
                  }}
                  disabled={isView || saving}
                  placeholder="VD: 4/16 Đoàn Hữu Trưng, Phường X, Quận Y, TP Z"
                />
              </div>
            </div>
          )}
        </section>

        {/* Giá/diện tích/số người + Tiện nghi */}
        <section className="p-4 border rounded-3 bg-white">
          <div className="fs-5 fw-semibold mb-3">Thông tin phòng</div>
          <div className="row gy-3">
            <div className="col-md-4">
              <label className="form-label">Giá / tháng (VND)</label>
              <input
                type="number"
                min="0"
                className="form-control"
                value={values.priceMonth}
                onChange={setValue('priceMonth')}
                disabled={isView || saving}
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">Tiền cọc (VND)</label>
              <input
                type="number"
                min="0"
                className="form-control"
                value={values.deposit}
                onChange={setValue('deposit')}
                disabled={isView || saving}
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">Diện tích (m²)</label>
              <input
                type="number"
                min="0"
                className="form-control"
                value={values.areaSqm}
                onChange={setValue('areaSqm')}
                disabled={isView || saving}
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">Số người tối đa</label>
              <input
                type="number"
                min="1"
                className="form-control"
                value={values.maxOccupancy}
                onChange={setValue('maxOccupancy')}
                disabled={isView || saving}
              />
            </div>
          </div>

          <div className="mt-4">
            <div className="fw-semibold mb-2">Tiện nghi</div>
            <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 g-2">
              {amenities.map((a) => {
                const id = a.id
                const checked = Array.isArray(values.amenityIds)
                  ? values.amenityIds.includes(id)
                  : false
                return (
                  <div className="col" key={id}>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id={`amen-${id}`}
                        checked={checked}
                        disabled={isView || saving}
                        onChange={(e) => {
                          setValues((s) => {
                            const set = new Set(
                              (s.amenityIds || []).map(Number)
                            )
                            if (e.target.checked) set.add(id)
                            else set.delete(id)
                            return { ...s, amenityIds: Array.from(set) }
                          })
                        }}
                      />
                      <label
                        className="form-check-label"
                        htmlFor={`amen-${id}`}
                      >
                        {a.name}
                      </label>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Hình ảnh */}
        <section className="p-4 border rounded-3 bg-white">
          <div className="d-flex align-items-center justify-content-between mb-3">
            <div className="fs-5 fw-semibold">Hình ảnh tổng quan</div>
            <div className="small text-muted">
              {values.imageUrls.length}/{MAX_IMAGES}
            </div>
          </div>

          {!isView && (
            <>
              <input
                id="roomImages"
                type="file"
                multiple
                accept="image/*"
                className="d-none"
                onChange={onPickFiles}
                disabled={
                  uploading || saving || values.imageUrls.length >= MAX_IMAGES
                }
              />
              <label
                htmlFor="roomImages"
                className="d-block p-5 text-center border border-primary-subtle rounded-3 bg-primary-subtle"
                style={{
                  cursor: uploading || saving ? 'not-allowed' : 'pointer',
                }}
              >
                <div className="mb-2">
                  <i className="bi bi-images fs-2" />
                </div>
                <div className="fw-semibold">Chọn hoặc kéo-thả hình ảnh</div>
                <div className="text-muted small">
                  Ảnh sẽ <b>chỉ xem trước</b>, <u>chưa upload</u>. Upload khi
                  bấm <b>Lưu</b>. Tối đa {MAX_IMAGES} ảnh.
                </div>
                {uploading && (
                  <div className="text-muted mt-2">Đang xử lý ảnh…</div>
                )}
              </label>
            </>
          )}

          {values.imageUrls.length > 0 && (
            <div className="d-flex flex-wrap gap-3 mt-3">
              {values.imageUrls.map((u, idx) => (
                <div key={`${u}-${idx}`} className="position-relative">
                  <img
                    src={u}
                    alt={`img-${idx}`}
                    className="border rounded-2"
                    style={{ width: 160, height: 120, objectFit: 'cover' }}
                    onError={(e) => (e.currentTarget.style.display = 'none')}
                  />
                  <div className="mt-1 d-flex align-items-center gap-2">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="cover"
                        checked={idx === 0}
                        readOnly
                      />
                      <label className="form-check-label small">Ảnh bìa</label>
                    </div>
                    {!isView && (
                      <>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() => makeCover(idx)}
                          disabled={saving}
                          title="Đặt làm bìa"
                        >
                          Đặt bìa
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => removeImage(idx)}
                          disabled={saving}
                          title="Xoá ảnh"
                        >
                          Xoá
                        </button>
                      </>
                    )}
                  </div>
                  {isBlob(u) && (
                    <div className="position-absolute top-0 start-0 badge text-bg-secondary ms-1 mt-1">
                      preview
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          <div className="form-text">
            * Ảnh đầu tiên sẽ là ảnh bìa. Tối thiểu {MIN_IMAGES} ảnh, tối đa{' '}
            {MAX_IMAGES} ảnh.
          </div>
        </section>

        {/* Mô tả */}
        <section className="p-4 border rounded-3 bg-white">
          <div className="fs-5 fw-semibold mb-3">Mô tả</div>
          <textarea
            rows={6}
            className="form-control"
            value={values.description}
            onChange={setValue('description')}
            disabled={isView || saving}
            placeholder="Viết mô tả về trọ"
          />
        </section>

        {!isView && (
          <div className="d-flex justify-content-end gap-2">
            <button
              className="btn btn-light"
              type="button"
              onClick={() => nav(-1)}
              disabled={saving}
            >
              Huỷ
            </button>
            <button className="btn btn-primary" type="submit" disabled={saving}>
              {saving ? 'Đang lưu...' : 'Lưu'}
            </button>
          </div>
        )}
      </form>
    </div>
  )
}
