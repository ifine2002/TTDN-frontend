import React, { useMemo, useRef, useState } from 'react';
import { Select, Spin } from 'antd';
import debounce from 'lodash/debounce';

/**
 * Component DebounceSelect cung cấp chức năng tìm kiếm với debounce
 * 
 * @param {Object} props
 * @param {Function} props.fetchOptions - Hàm lấy dữ liệu options từ API
 * @param {number} props.debounceTimeout - Thời gian debounce (mặc định: 800ms)
 * @param {any} props.value - Giá trị hiện tại của Select
 * @returns {React.ReactElement}
 */
function DebounceSelect({ fetchOptions, debounceTimeout = 800, value, ...props }) {
    const [fetching, setFetching] = useState(false);
    const [options, setOptions] = useState([]);
    const fetchRef = useRef(0);

    const debounceFetcher = useMemo(() => {
        const loadOptions = (value) => {
            fetchRef.current += 1;
            const fetchId = fetchRef.current;
            setOptions([]);
            setFetching(true);

            fetchOptions(value).then((newOptions) => {
                if (fetchId !== fetchRef.current) {
                    // kiểm tra thứ tự callback của fetch
                    return;
                }

                setOptions(newOptions);
                setFetching(false);
            });
        };

        return debounce(loadOptions, debounceTimeout);
    }, [fetchOptions, debounceTimeout]);

    const handleOnFocus = () => {
        // fetch dữ liệu ban đầu khi focus vào input
        if (options && options.length > 0) {
            return;
        }
        fetchOptions("").then((newOptions) => {
            setOptions([...options, ...newOptions]);
        });
    }

    const handleOnBlur = () => {
        setOptions([]);
    }

    return (
        <Select
            labelInValue
            filterOption={false}
            onSearch={debounceFetcher}
            notFoundContent={fetching ? <Spin size="small" /> : null}
            {...props}
            options={options}
            onFocus={handleOnFocus}
            onBlur={handleOnBlur}
        />
    );
}

export default DebounceSelect;