import { Float, type FloatProps } from "@headlessui-float/react";

export const TransitionFloat = (props: FloatProps) => (
  <Float
    offset={8}
    flip
    shift={6}
    portal
    enter="transition duration-100 ease-out"
    enterFrom="scale-95 opacity-0"
    enterTo="scale-100 opacity-100"
    leave="transition duration-75 ease-in"
    leaveFrom="scale-100 opacity-100"
    leaveTo="scale-95 opacity-0"
    tailwindcssOriginClass
    {...props}
  >
    {props.children}
  </Float>
);
