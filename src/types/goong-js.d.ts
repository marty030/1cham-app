// @goongmaps/goong-js không kèm sẵn file khai báo TypeScript (nó là bản fork
// của mapbox-gl-js). Khai báo tối thiểu này chỉ để tsc không báo lỗi khi
// import động trong ChonDiaChi.tsx — dùng "any" vì ta chỉ cần map/marker cơ bản.
declare module "@goongmaps/goong-js";