import {
  ActionIcon,
  TextInput,
  Select,
  NumberInput,
  Textarea,
  Box,
  Title,
  rem,
  Group,
  Button,
  MultiSelect,
} from "@mantine/core";
import { TimeInput } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { IconClock } from "@tabler/icons-react";
import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useOutletContext } from "react-router-dom";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { useDisclosure } from "@mantine/hooks";
import Modal from "../../components/Parts/Modal";
import useFetch from "../../hooks/useFetch";
import useToast from "../../hooks/useToast";
import useCheckBooking from "../../hooks/useCheckBooking";
import LoadingSpinner from "../../components/Parts/LoadingSpinner";

function EditRestaurant() {
  const [opened, { toggle, close }] = useDisclosure(false);
  const navigate = useNavigate();
  const { sendRequest } = useFetch();
  const { successToast, errorToast } = useToast();
  const [data, setData] = useState([]);
  const [payload, setPayload] = useState({});
  const [loading, setLoading] = useState(true);
  const { formatTime } = useCheckBooking();
  dayjs.extend(customParseFormat);
  const { user } = useOutletContext();

  const form = useForm({
    // Added initialValues to prevent "uncontrolled input" warnings
    initialValues: {
      name: "",
      category: "",
      location: "",
      address: "",
      phone: "",
      websiteUrl: "",
      maxPax: 10,
      timeOpen: "",
      timeClose: "",
      daysClose: [],
      description: "",
      image: "",
    },
    validate: {
      category: (value) =>
        !value &&
        "Please choose a category which best represents your restaurant cuisine",
      location: (value) =>
        !value &&
        "Please choose an area which best represents your restaurant's location",
      address: (value) =>
        !value && "Please provide your restaurant address",
      maxPax: (value) =>
        !value &&
        "Please enter a number for the max no. of people your restaurant can accept for bookings",
      timeOpen: (value) => !value && "Please enter a time",
      timeClose: (value, values) =>
        !value
          ? "Please enter a time"
          : value < values.timeOpen &&
            "Closing time must be later than opening time.",
      description: (value) =>
        value?.length > 500 && "Please enter less than 500 characters",
    },
  });

  useEffect(() => {
    if (!user || !user.isOwner) {
      navigate("/signin");
      return;
    }
    const getData = async () => {
      try {
        const resData = await sendRequest(
          `${import.meta.env.VITE_API_URL}/restaurant/user`,
          "GET"
        );
        if (!resData || resData.length === 0) {
          navigate("/owner/restaurant");
          return;
        }
        
        setData(resData);
        
        // Populate form with existing data
        form.setValues({
          name: resData.name || "",
          image: resData.image || "",
          category: resData.category || "",
          location: resData.location || "",
          timeOpen: formatTime(resData.timeOpen),
          timeClose: formatTime(resData.timeClose),
          address: resData.address || "",
          daysClose: resData.daysClose || [],
          phone: resData.phone || "",
          websiteUrl: resData.websiteUrl || "",
          maxPax: resData.maxPax || 10,
          description: resData.description || "",
        });
        setLoading(false);
      } catch (error) {
        console.log(error);
        setLoading(false);
      }
    };
    getData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async () => {
    try {
      const res = await sendRequest(
        `${import.meta.env.VITE_API_URL}/restaurant/${data._id}/edit`,
        "POST",
        payload
      );
      console.log(res);
      navigate("/owner/restaurant");
      close();
      successToast({
        title: "Restaurant Info Successfully Updated!",
        message: "Your restaurant is now listed and available for reservations",
      });
    } catch (err) {
      console.log(err);
      close();
      errorToast();
    }
  };

  const refOpen = useRef(null);
  const refClose = useRef(null);

  const pickerControlOpen = (
    <ActionIcon
      variant="subtle"
      color="gray"
      onClick={() => refOpen.current?.showPicker()}
    >
      <IconClock style={{ width: rem(16), height: rem(16) }} stroke={1.5} />
    </ActionIcon>
  );

  const pickerControlClose = (
    <ActionIcon
      variant="subtle"
      color="gray"
      onClick={() => refClose.current?.showPicker()}
    >
      <IconClock style={{ width: rem(16), height: rem(16) }} stroke={1.5} />
    </ActionIcon>
  );

  const confirmInput = (input) => {
    const formSubmit = {
      name: input.name,
      image: input.image,
      category: input.category,
      location: input.location,
      timeOpen: parseInt(input.timeOpen.split(":").join("")),
      timeClose: parseInt(input.timeClose.split(":").join("")),
      address: input.address,
      daysClose: input.daysClose,
      phone: input.phone,
      websiteUrl: input.websiteUrl,
      maxPax: input.maxPax,
      description: input.description,
    };
    setPayload(formSubmit);
  };

  // get user edited info
  const compareData = (var1, var2) => {
    const displayData = {};

    Object.keys(var1).forEach((key) => {
      if (Object.prototype.hasOwnProperty.call(var2, key)) {
        // need separate comparison for daysClose as it is stored as an array in the backend db
        if (key === "daysClose") {
          if (var1.daysClose) {
            const isDaysCloseEqual =
              var1.daysClose.length === var2.daysClose.length &&
              var1.daysClose.every((day) => var2.daysClose.includes(day));

            if (!isDaysCloseEqual) {
              displayData[key] = var1[key];
            }
          } else {
            return;
          }
        } else if (var1[key] !== var2[key]) {
          displayData[key] = var1[key];
        }
      }
    });

    if (Object.keys(displayData).length === 0) {
      return "No differing values. Pls update the relevant fields.";
    } else {
      return (
        <ul>
          {Object.entries(displayData).map(([key, value]) => (
            <li key={key}>
              {/* --- FIX: Added Array Check here to prevent Crash --- */}
              {key === "daysClose"
                ? `Days Closed: ${Array.isArray(value) ? value.join(", ") : value}`
                : key === "maxPax"
                ? `Maximum Pax: ${value}`
                : key === "timeOpen"
                ? `Opening Time: ${formatTime(value)}`
                : key === "timeClose"
                ? `Closing Time: ${formatTime(value)}`
                : key === "websiteURL"
                ? `Website: ${value}`
                : `${key}: ${value}`}
            </li>
          ))}
        </ul>
      );
    }
  };

  return (
    <>
      {loading ? (
        <LoadingSpinner />
      ) : (
        <>
          <Title order={2} ta="center">
            Update Your Restaurant
          </Title>
          <Box maw={500} mx="auto" mt="xl">
            <form
              onSubmit={form.onSubmit(() => {
                if (form.isValid()) {
                  confirmInput(form.values);
                  toggle();
                }
              })}
            >
              <TextInput
                label="Name"
                withAsterisk
                placeholder="GA Cafe"
                {...form.getInputProps("name")}
              />
              <Select
                label="Category"
                withAsterisk
                placeholder="Pick one"
                data={["Asian", "Chinese", "Japanese", "Western"]}
                mt="md"
                {...form.getInputProps("category")}
              />
              
              {/* --- UPDATED LOCATION LIST (Delhi NCR) --- */}
              <Select
                label="Location"
                withAsterisk
                placeholder="Select Area"
                searchable
                data={[
                    // Delhi Central/South
                    "Connaught Place (CP)",
                    "Hauz Khas Village",
                    "Saket",
                    "Vasant Kunj",
                    "Nehru Place",
                    "Lajpat Nagar",
                    "Greater Kailash (GK)",
                    "Khan Market",
                    
                    // Delhi West/North
                    "Rajouri Garden",
                    "Punjabi Bagh",
                    "Dwarka",
                    "Rohini",
                    "Pitampura",
                    "Kamla Nagar",
                
                    // Gurugram (Gurgaon)
                    "Cyber Hub (Gurgaon)",
                    "Sector 29 (Gurgaon)",
                    "Golf Course Road (Gurgaon)",
                    "MG Road (Gurgaon)",
                    "Udyog Vihar (Gurgaon)",
                    "Sohna Road (Gurgaon)",
                
                    // Noida & Others
                    "Sector 18 (Noida)",
                    "Sector 62 (Noida)",
                    "Greater Noida",
                    "Ghaziabad",
                    "Faridabad"
                ]}
                mt="md"
                {...form.getInputProps("location")}
              />

              <TextInput
                label="Address"
                withAsterisk
                placeholder="79 Anson Rd, Level 20, Singapore 079906"
                mt="md"
                {...form.getInputProps("address")}
              />
              <TextInput
                label="Phone"
                type="number"
                placeholder="9999999999 (Exclude +91 country code)"
                mt="md"
                {...form.getInputProps("phone")}
              />
              <TextInput
                label="Website URL"
                placeholder="https://gacafe.com"
                mt="md"
                {...form.getInputProps("websiteUrl")}
              />
              <NumberInput
                label="Maximum Pax"
                placeholder="10"
                min={1}
                required
                mt="md"
                {...form.getInputProps("maxPax")}
              />
              <TimeInput
                label="Opening Time"
                withAsterisk
                mt="md"
                ref={refOpen}
                required
                rightSection={pickerControlOpen}
                {...form.getInputProps("timeOpen")}
              />
              <TimeInput
                label="Closing Time"
                withAsterisk
                mt="md"
                ref={refClose}
                required
                rightSection={pickerControlClose}
                {...form.getInputProps("timeClose")}
              />
              <MultiSelect
                label="Days Closed"
                placeholder="Pick one or more"
                data={[
                  "Sunday",
                  "Monday",
                  "Tuesday",
                  "Wednesday",
                  "Thursday",
                  "Friday",
                  "Saturday",
                ]}
                clearable
                searchable
                mt="md"
                {...form.getInputProps("daysClose")}
              />
              <Textarea
                label="Description"
                mt="md"
                placeholder="A cozy cafe offering a wide range of coffee, tea, and pastries."
                autosize="true"
                minRows={3}
                {...form.getInputProps("description")}
              />
              <TextInput
                label="Image"
                mt="md"
                placeholder="https://gacafe.com/image.jpg"
                {...form.getInputProps("image")}
              />

              <Group justify="center" mt="xl">
                <Button
                  type="button"
                  component={Link}
                  to={`/owner/restaurant`} //return to Owner Dashboard
                  variant="outline"
                >
                  Cancel
                </Button>
                <Button type="submit">Update</Button>
              </Group>
            </form>

            <Modal
              opened={opened}
              title="Update Restaurant"
              modalContent={compareData(payload, data)}
              toggle={toggle}
              close={close}
              handleSubmit={handleSubmit}
            />
          </Box>
        </>
      )}
    </>
  );
}

export default EditRestaurant;